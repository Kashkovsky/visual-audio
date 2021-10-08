import { Sound } from './audio'
import { flow } from 'fp-ts/es6/function'
import { AnimationStrategy, sineStrategy, spectrumStrategy, pulseStrategy } from './strategy'
import Rx from './rx'
import { ShapeKind } from './utils'
import { easeOutElastic } from './animation'

const analyserConfig = { minDecibels: -90, maxDecibels: -10, fftSize: 256 }

export const App = (): Rx.Subscription =>
  Sound.createFor(
    flow(
      Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
      Sound.AnalysedNode.attachAnimation(
        flow(
          AnimationStrategy.create(spectrumStrategy({})),
          AnimationStrategy.chainMutation(sineStrategy({ stroke: 'white' })),
          AnimationStrategy.chainMutation(
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
          AnimationStrategy.chainMutation(
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
          AnimationStrategy.render()
        )
      )
    )
  ).subscribe()
