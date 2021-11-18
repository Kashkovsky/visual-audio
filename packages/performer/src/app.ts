import { Sound, Rx, AnimationStrategy } from '@va/engine'
import { genericStrategy, Amorph } from '@va/visuals'
import * as THREE from 'three'
import { flow, pipe } from 'fp-ts/es6/function'

const analyserConfig = { minDecibels: -90, maxDecibels: -10, fftSize: 256, mute: true }

// TODO: Introduce some UI for Recorder
// const recordEnabled = Rx.of(false).pipe(
//   Rx.delay(4000),
//   Rx.switchMap(() => Rx.timer(10000).pipe(Rx.mapTo(false), Rx.startWith(true)))
// )

export const App3D = (): Rx.Subscription =>
  pipe(
    Sound.createFor(
      flow(
        Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
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
    // OutputStream.record(recordEnabled)
  ).subscribe()
