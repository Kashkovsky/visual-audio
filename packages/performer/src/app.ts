import { Sound, Rx, AnimationStrategy } from '@va/engine'
import { genericStrategy, Amorph } from '@va/visuals'
import * as THREE from 'three'
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
          AnimationStrategy.create(
            genericStrategy({
              element: Amorph.create({}),
              background: new THREE.Color('#0c0c0c')
            })
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
