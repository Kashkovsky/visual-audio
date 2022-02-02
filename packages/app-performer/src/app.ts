import { Sound, Rx, VAWorker, AnalysisData } from '@va/engine'
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
export const App3D = (): Rx.Observable<AnalysisData.Frequency> =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut(analyzerConfig),
        Rx.switchMap(n => {
          const canvas = document.createElement('canvas')
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          document.body.prepend(canvas)
          const _w = new Worker('worker.js', { type: 'module' })

          const worker = VAWorker.create(workerConfig(_w, canvas))

          const resizeObserver = Rx.fromEvent(window, 'resize').pipe(
            Rx.tap(() => worker.resize()),
            Rx.ignoreElements()
          )

          return Rx.mergeStatic(resizeObserver, n.frequency.pipe(Rx.tap(worker.frequency)))
        })
        // Sound.AnalysedNode.attachAnimation(animation),
        // AnimationStrategy.Animation3D.toScene(renderOptions)
      )
    )
  )
