import { Sound, Rx, AnimationStrategy } from '@va/engine'
import { particleDissolveStrategy } from '@va/visuals'
import { flow, pipe } from 'fp-ts/es6/function'

const analyzerConfig: Sound.AnalysedNode.AnalyserConfig = {
  minDecibels: -90,
  maxDecibels: -10,
  fftSize: 256
}

const animation = AnimationStrategy.create(
  particleDissolveStrategy({
    fromCamera: true
  })
)

const renderOptions: AnimationStrategy.Animation3D.RenderOptions = {
  cameraOptions: {
    fov: 70,
    near: 0.01,
    far: 1000
  },
  rendererOptions: {
    antialias: true
  }
}

export const App3D = (): Rx.Observable<MediaStream> =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut(analyzerConfig),
        Sound.AnalysedNode.attachAnimation(animation),
        AnimationStrategy.Animation3D.toScene(renderOptions)
      )
    )
  )
