import { Endomorphism } from 'fp-ts/es6/Endomorphism'
import Rx from '../rx'
import { Recorder } from './recorder'

export namespace OutputStream {
  export const record =
    (state: Rx.Observable<boolean>): Endomorphism<Rx.Observable<MediaStream>> =>
    stream => {
      const record = stream.pipe(
        Rx.map(Recorder.create),
        Rx.switchMap(rec => rec.record(state)),
        Rx.ignoreElements()
      )

      return Rx.mergeStatic(record, stream)
    }
}
