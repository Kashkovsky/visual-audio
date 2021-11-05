import Rx from './index'
import * as O from 'fp-ts/es6/Option'

export function compactMap<T, U>(
  cb: (val: T) => Rx.Observable<U>
): Rx.OperatorFunction<O.Option<T>, U> {
  return Rx.switchMap(O.fold(Rx.empty, cb))
}

export function rafScheduler<T>(value: T): Rx.Observable<T> {
  return new Rx.Observable((obs: Rx.Observer<T>) => {
    const frame = requestAnimationFrame(() => obs.next(value))
    return () => cancelAnimationFrame(frame)
  })
}
