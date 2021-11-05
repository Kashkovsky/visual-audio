import { Endomorphism } from 'fp-ts/es6/Endomorphism'
import Rx from '../rx'
import { duration } from './duration'
import { FRAMES } from './frames'

/**
 * Configuration for a {@link tween} call.
 */
export interface TweenConfig {
  /**
   * The starting number of the tween
   */
  start: number
  /**
   * The final number to tween to.
   */
  end: number
  /**
   * The amount of time to tween between the `start` and the `end` values.
   */
  duration: number
  /**
   * An optional global frame source. An observable of elapsed milliseconds since subscription.
   */
  frames?: Rx.Observable<number>
  /**
   * An optional easing function
   */
  easing?: Endomorphism<number>
}

/**
 * Returns an observable of numbers between a `start` and an `end` value, incrementally moving
 * from `start` toward `end` over the period specified as `duration` in the config object.
 *
 * Additionally, an easing function can be provided.
 *
 * @param config The tween configuration
 */
export function tween({
  start,
  end,
  duration: ms,
  easing = Rx.identity,
  frames = FRAMES
}: TweenConfig): Rx.Observable<number> {
  const diff = end - start
  return duration(ms, frames).pipe(Rx.map(d => easing(d) * diff + start))
}
