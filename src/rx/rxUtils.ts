import Rx from './index'
import * as O from 'fp-ts/lib/Option'
import { Atom } from '@grammarly/focal';

export function isObservable(input: any): input is Rx.InteropObservable<any> {
	return input && 'subscribe' in input;
}

export function compactMap<T, U>(cb: (val: T) => Rx.Observable<U>): Rx.OperatorFunction<O.Option<T>, U> {
	return Rx.switchMap(O.fold(Rx.empty, cb))
}

export const log = <T>(source: Rx.Observable<T>, name: string) =>
	Rx.defer(() => {
		console.log(`${name}: subscribed`)
		return source.pipe(
			Rx.tap({
				next: value => console.log(`${name}: ${value}`),
				complete: () => console.log(`${name}: complete`)
			}),
			Rx.finalize(() => console.log(`${name}: unsubscribed`))
		)
	})

export const chooseWhen = (condition: Rx.Observable<boolean>) => <T>(left: T, right: T) =>
	condition.pipe(Rx.map(x => (x ? left : right)))

export function rafScheduler<T>(value: T): Rx.Observable<T> {
	return Rx.Observable.create((obs: Rx.Observer<T>) => {
		const frame = requestAnimationFrame(() => obs.next(value))
		return () => cancelAnimationFrame(frame)
	})
}

export const toAtom = <T>(atom: Atom<T>) => Rx.tap<T>(v => atom.set(v))

export class SubscriptionKeeper {
	private _subs: Rx.Subscription[] = []
	push(...subs: Rx.Subscription[]) {
		this._subs.push(...subs)
	}

	dispose() {
		this._subs.forEach(s => s.unsubscribe())
	}
}