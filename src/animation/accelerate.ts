import Rx from '../rx';
import { FRAMES } from './frames';

/**
 * A construct for providing information about an accelerating value.
 */
export interface VelocityData {
  /** The current velocity the value is increasing at */
  velocity: number;
  /** The current value */
  value: number;
}

export interface AccelerateConfig {
  unitsPerMs2: number;
  initialVelocity: number;
  frames?: Rx.Observable<number>;
}

/**
 * Returns an observable of values that increase at an ever increasing velocity, given a specific acceleration.
 * 
 */
export function accelerate({ unitsPerMs2, initialVelocity = 0, frames = FRAMES } : AccelerateConfig): Rx.Observable<VelocityData> {
  return frames.pipe(
    Rx.scan((state, elapsed) => {
      const velocity = state.velocity += unitsPerMs2 * elapsed;
      state.value += velocity;
      return state;
    }, {
      velocity: initialVelocity,
      value: 0,
    }),
  )
}