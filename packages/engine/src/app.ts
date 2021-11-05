import { Sound } from './audio'
import * as THREE from 'three'
import { flow, pipe } from 'fp-ts/es6/function'
import {
  AnimationStrategy,
  sineStrategy,
  spectrumStrategy,
  pulseStrategy,
  //   particleDissolveStrategy,
  genericStrategy
} from './strategy'
import Rx from './rx'
import { ShapeKind } from './utils'
import { easeOutElastic } from './animation'
// import * as portrait from '../assets/portrait.png'
import { Amorph } from './elements'
// import { OutputStream } from './postProcessing'

const analyserConfig = { minDecibels: -90, maxDecibels: -10, fftSize: 256 }

export const App2D = (): Rx.Subscription =>
  Sound.createFor(
    flow(
      Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
      Sound.AnalysedNode.attachAnimation(
        flow(
          AnimationStrategy.create(spectrumStrategy({})),
          AnimationStrategy.Animation2D.chain(sineStrategy({ stroke: 'white' })),
          AnimationStrategy.Animation2D.chain(
            pulseStrategy({
              kind: ShapeKind.circle,
              config: {
                stroke: 'white',
                fill: 'grey',
                x: 100,
                y: 100
              }
            })
          ),
          AnimationStrategy.Animation2D.chain(
            pulseStrategy({
              kind: ShapeKind.star,
              config: {
                stroke: 'white',
                fill: 'grey',
                numPoints: 6,
                innerRadius: 100,
                outerRadius: 200
              },
              center: true,
              easing: easeOutElastic,
              tolerance: 100
            })
          )
        )
      ),
      AnimationStrategy.Animation2D.toStage()
    )
  ).subscribe()

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
