import Rx from '../../rx'
import { AnalysisData } from '../../audio'
import { duration } from '../duration'
import { pipe } from 'fp-ts/es6/function'
import { Endomorphism } from 'fp-ts/es6/Endomorphism'
import { FRAMES } from '../frames'

export interface FadeOutConfig {
  /**
   * The amount of time to tween between the `start` and the `end` values.
   */
  readonly duration: number
  /**
   * An optional easing function
   */
  readonly easing?: Endomorphism<number>
  /**
   * An optional global frame source. An observable of elapsed milliseconds since subscription.
   */
  readonly frames?: Rx.Observable<number>
}

/** Creates fading out signal tail */
export const reverb = ({
  duration: ms,
  frames = FRAMES,
  easing = Rx.identity
}: FadeOutConfig): Rx.MonoTypeOperatorFunction<AnalysisData> =>
  Rx.switchMap(data =>
    duration(ms, frames).pipe(
      Rx.map(v =>
        pipe(
          data,
          AnalysisData.map(x => Math.max(x - easing(v) * Math.max(x - v, x), 0))
        )
      ),

      Rx.startWith(data)
    )
  )
