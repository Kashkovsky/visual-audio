import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
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
    return audio.timeDomain.pipe(
      Rx.map(
        AnalysisData.Frequency.filter(
          AnalysisData.Frequency.Fraction.subBass,
          AnalysisData.Frequency.Fraction.bass
        )
      ),
      Rx.tap(data => {
        layer.destroyChildren()

        const size = data.reduce((a, c) => a + c, 0) / data.length
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
