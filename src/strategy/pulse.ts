import Konva from 'konva'
import { ShapeKind, ShapeParams } from '../utils'
import { RxAnimation } from '../animation'
import { AnalysisData } from '../audio'
import Rx from '../rx'
import { AnimationStrategy } from './interfaces'
import { Endomorphism } from 'fp-ts/es6/Endomorphism'

export interface PulseStrategyConfig<K extends ShapeKind> extends ShapeParams<K> {
  /** Animation will not be triggered for signal lower than value */
  readonly tolerance?: number
  /** Ho intensively should size react to signal */
  readonly sizeFactor?: number
  /** Should the pulse be centered */
  readonly center?: boolean
  /**  An optional easing function */
  readonly easing?: Endomorphism<number>
}

export const pulseStrategy =
  <K extends ShapeKind>(params: PulseStrategyConfig<K>): AnimationStrategy.MutationFactory =>
  audio =>
  stage => {
    const layer = new Konva.Layer()
    stage.add(layer)
    return audio.frequency.pipe(
      // Pick low bass only
      Rx.map(AnalysisData.Frequency.pick(AnalysisData.Frequency.Fraction.subBass)),
      // Filter out quiet signal
      Rx.filter(AnalysisData.isGreaterThan(params.tolerance || 150)),
      // Create fading out tail
      RxAnimation.reverb({ duration: 500, easing: params.easing }),
      // Draw shape
      Rx.tap(data => {
        layer.destroyChildren()
        const size = AnalysisData.mean(data) * (params.sizeFactor || 1)
        const shape = ShapeParams.toShape<K>(params)({
          width: size,
          height: size,
          ...(params.center
            ? {
                x: stage.width() / 2,
                y: stage.height() / 2
              }
            : null)
        })

        layer.add(shape)
      }),
      Rx.mapTo(void 0)
    )
  }
