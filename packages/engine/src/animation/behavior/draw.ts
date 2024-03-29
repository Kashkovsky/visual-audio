import { flow } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import { Rx } from '../../rx'

export const draw = <T>(f: Reader<T, void>): Reader<Rx.Observable<T>, Rx.Observable<void>> =>
  flow(Rx.tap(f), Rx.mapTo<void>(void 0))
