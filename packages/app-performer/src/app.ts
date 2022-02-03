import { Sound, Rx, VAWorker } from '@va/engine'
import { flow, pipe } from 'fp-ts/es6/function'

const analyzerConfig: Sound.AnalysedNode.AnalyserConfig = {
  minDecibels: -90,
  maxDecibels: -10,
  fftSize: 256,
  mute: true
}

const workerConfig = (worker: Worker, canvas: HTMLCanvasElement) => ({
  worker,
  canvas: canvas,
  options: {
    cameraOptions: {
      fov: 70,
      near: 0.01,
      far: 1000
    },
    rendererOptions: {
      antialias: true
    },
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
})

export const App3D = () =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut(analyzerConfig),
        Rx.first(),
        Rx.switchMap(node => {
          let canvas: HTMLCanvasElement
          const existing = document.getElementsByTagName('canvas').item(0)
          if (existing) {
            canvas = existing
          } else {
            canvas = document.createElement('canvas')
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            document.body.prepend(canvas)
          }
          const _w = new Worker('worker.js', { type: 'module' })
          const worker = VAWorker.create(workerConfig(_w, canvas))
          worker.startAnimation('frequencyPlaneStrategy', {})

          const resizeObserver = Rx.fromEvent(window, 'resize').pipe(
            Rx.tap(() => worker.resize()),
            Rx.ignoreElements()
          )

          // TODO: send waveform to worker
          return Rx.mergeStatic(resizeObserver, node.frequency.pipe(Rx.tap(worker.frequency)))
        })
      )
    )
  )
