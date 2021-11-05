import { Endomorphism } from 'fp-ts/es6/Endomorphism'
import Rx from '../rx'
import { Recorder } from './recorder'
import * as E from 'fp-ts/es6/Either'

export namespace OutputStream {
  export const record =
    (state: Rx.Observable<boolean>): Endomorphism<Rx.Observable<MediaStream>> =>
    stream => {
      const record = stream.pipe(
        Rx.map(Recorder.create),
        Rx.switchMap(
          E.fold(
            e => (console.error(e.message), Rx.EMPTY),
            rec => rec.record(state)
          )
        ),
        Rx.ignoreElements()
      )

      return Rx.mergeStatic(record, stream)
    }
}
