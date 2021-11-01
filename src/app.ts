import { Sound } from './audio'
import { flow } from 'fp-ts/es6/function'
import {
  AnimationStrategy,
  sineStrategy,
  spectrumStrategy,
  pulseStrategy,
  particleDissolveStrategy
} from './strategy'
import Rx from './rx'
import { ShapeKind } from './utils'
import { easeOutElastic } from './animation'
import * as portrait from '../assets/portrait.png'

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
          ),
          AnimationStrategy.Animation2D.render()
        )
      )
    )
  ).subscribe()

export const App3D = (): Rx.Subscription =>
  Sound.createFor(
    flow(
      Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
      Sound.AnalysedNode.attachAnimation(
        flow(
          AnimationStrategy.create(
            particleDissolveStrategy({
              imageUrl: portrait
            })
          ),
          // AnimationStrategy.Animation3D.chain(discoballStrategy()),
          AnimationStrategy.Animation3D.render({
            cameraOptions: {
              fov: 70,
              near: 0.01,
              far: 1000
            },
            rendererOptions: {
              antialias: true,
              alpha: true
            }
          })
        )
      )
    )
  ).subscribe()
