import Rx from '../rx';
import { FRAMES } from './frames';

/**
 * Returns an `Observable` of numbers progressing by a given velocity.
 * 
 * The number can represent any unit, but is commonly used to represent pixels travelled
 * or degrees rotated, etc.
 * 
 * @param unitsPerMillisecond The number of units to progress per millisecond
 * @param frames The frame source, an observable of milliseconds elapsed since start. {@see FRAMES}
 */
export function velocity(unitsPerMillisecond: number, frames: Rx.Observable<number> = FRAMES) {
  return frames.pipe(
    Rx.map(elapsed => elapsed * unitsPerMillisecond)
  )
}