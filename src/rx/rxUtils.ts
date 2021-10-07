import Rx from './index'
import * as O from 'fp-ts/es6/Option'
import { Atom } from '@grammarly/focal'

export function compactMap<T, U>(
  cb: (val: T) => Rx.Observable<U>
): Rx.OperatorFunction<O.Option<T>, U> {
  return Rx.switchMap(O.fold(Rx.empty, cb))
}

export const log = <T>(source: Rx.Observable<T>, name: string): Rx.Observable<T> =>
  Rx.defer(() => {
    console.log(`${name}: subscribed`)
    return source.pipe(
      Rx.tap({
        next: value => console.log(`${name}: ${JSON.stringify(value)}`),
        complete: () => console.log(`${name}: complete`)
      }),
      Rx.finalize(() => console.log(`${name}: unsubscribed`))
    )
  })

export const chooseWhen =
  (condition: Rx.Observable<boolean>) =>
  <T>(left: T, right: T): Rx.Observable<T> =>
    condition.pipe(Rx.map(x => (x ? left : right)))

export function rafScheduler<T>(value: T): Rx.Observable<T> {
  return new Rx.Observable((obs: Rx.Observer<T>) => {
    const frame = requestAnimationFrame(() => obs.next(value))
    return () => cancelAnimationFrame(frame)
  })
}

export const toAtom = <T>(atom: Atom<T>): Rx.MonoTypeOperatorFunction<T> =>
  Rx.tap<T>(v => atom.set(v))

export class SubscriptionKeeper {
  private _subs: Rx.Subscription[] = []
  push(...subs: Rx.Subscription[]): void {
    this._subs.push(...subs)
  }

  dispose(): void {
    this._subs.forEach(s => s.unsubscribe())
  }
}
