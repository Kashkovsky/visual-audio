import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
import { easeInBack, RxAnimation } from '../animation'
import { AnalysisData } from '../audio'
import Rx from '../rx'
import { AnimationStrategy } from './interfaces'

export interface PulseStrategyConfig extends Konva.ShapeConfig {
  readonly stroke?: string
  readonly radiusFactor?: number
}
export const pulseStrategy: Reader<PulseStrategyConfig, AnimationStrategy.MutationFactory> =
  ({ stroke = 'black', radiusFactor = 1 }) =>
  audio =>
  stage => {
    const layer = new Konva.Layer()
    stage.add(layer)
    return audio.frequency.pipe(
      // Pick low bass only
      Rx.map(AnalysisData.Frequency.pick(AnalysisData.Frequency.Fraction.subBass)),
      // Filter out quiet signal
      Rx.filter(AnalysisData.isGreaterThan(100)),
      // Create fading out tail
      RxAnimation.reverb({ duration: 1000, easing: easeInBack }),
      // Draw circle
      Rx.tap(data => {
        layer.destroyChildren()
        const size = AnalysisData.mean(data)

        const circle = new Konva.Circle({
          x: stage.width() / 2,
          y: stage.height() / 2,
          radius: size * radiusFactor,
          stroke
        })
        layer.add(circle)
      }),
      Rx.mapTo(void 0)
    )
  }
