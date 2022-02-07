import { Sound, Rx, MultiProcessAnimation } from '@va/engine'
import { flow, pipe } from 'fp-ts/es6/function'
import { GUI } from 'dat.gui'

const analyzerConfig: Sound.AnalysedNode.AnalyserConfig = {
  minDecibels: -90,
  maxDecibels: -10,
  fftSize: 256,
  mute: true
}

const mpaConfig: MultiProcessAnimation.Config = {
  workerUrl: 'worker.js',
  gui: new GUI({ hideable: true }),
  options: {
    cameraOptions: {
      fov: 70,
      near: 0.01,
      far: 1000
    },
    rendererOptions: {
      antialias: true
    },
    rect: {
      width: window.innerWidth,
      height: window.innerHeight,
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth
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
