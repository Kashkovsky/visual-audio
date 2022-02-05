import { Sound, Rx, MultiProcessAnimation } from '@va/engine'
import { flow, pipe } from 'fp-ts/es6/function'

const analyzerConfig: Sound.AnalysedNode.AnalyserConfig = {
  minDecibels: -90,
  maxDecibels: -10,
  fftSize: 256,
  mute: true
}

const mpaConfig: MultiProcessAnimation.Config = {
  workerUrl: 'worker.js',
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
  // stats: MultiProcessAnimation.Config.Stats.fps
}

export const App3D = (): Rx.Observable<MediaStream> =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut(analyzerConfig),
        MultiProcessAnimation.create(mpaConfig),
        Rx.tap(({ worker }) => worker.startAnimation('bullHeadStrategy', {})),
        Rx.map(p => p.stream)
      )
    )
  )
