import { Sound, Rx, AnimationStrategy } from '@va/engine'
import { Amorph, frequencyPlaneStrategy, genericStrategy } from '@va/visuals'
import { flow, pipe } from 'fp-ts/es6/function'

export const App3D = (): Rx.Observable<MediaStream> =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut({
          minDecibels: -90,
          maxDecibels: -10,
          fftSize: 256
        }),
        Sound.AnalysedNode.attachAnimation(
          flow(
            AnimationStrategy.create(
              genericStrategy({
                element: Amorph.create({
                  distortionFrequency: 2,
                  displasementStrength: 0.001,
                  rotationFactor: 0.2
                }),
                source: 'frequency'
              })
            ),
            AnimationStrategy.Animation3D.chain(frequencyPlaneStrategy())
          )
        ),
        AnimationStrategy.Animation3D.toScene({
          cameraOptions: {
            fov: 70,
            near: 0.01,
            far: 1000
          },
          rendererOptions: {
            antialias: true
          }
        })
      )
    )
  )
