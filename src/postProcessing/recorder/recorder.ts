import { IO } from 'fp-ts/es6/IO'
import { Event } from 'three'
import Rx from '../../rx'

export interface Recorder {
  readonly events: Recorder.Events
  readonly start: IO<void>
  readonly stop: IO<void>
  readonly record: (state: Rx.Observable<boolean>) => Rx.Observable<Blob[]>
}

export namespace Recorder {
  /** BEVARE: Draft version, works in Chrome only */
  export const create = (stream: MediaStream): Recorder => {
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 5000000
    })
    const events = Recorder.Events.create(recorder)
    return {
      events,
      start: () => recorder.start(3000),
      stop: () => recorder.stop(),
      record: state => {
        console.log('Record idle')
        recorder.onstart = () => console.log('s')
        const recordStream = events.started.pipe(
          Rx.tap(() => console.log('Recorder started')),
          Rx.switchMap(() =>
            events.dataAvailable.pipe(
              Rx.map(e => e.data),
              Rx.filter(data => data.size > 0),
              Rx.bufferWhen(() => events.stopped),
              Rx.take(1),
              Rx.tap(() => console.log('Recorder finished'))
            )
          ),
          Rx.tap(chunks => {
            // Download hack
            const blob = new Blob(chunks, {
              type: 'video/webm'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.setAttribute('style', 'display: none')
            document.body.appendChild(a)
            a.href = url
            a.download = 'test.webm'
            a.click()
            window.URL.revokeObjectURL(url)
          })
        )
        const stateSwitch = state.pipe(
          Rx.delay(1),
          Rx.tap(e => console.log('rec status', e)),
          Rx.tap(enabled => (enabled ? recorder.start(3000) : recorder.stop())),
          Rx.ignoreElements()
        )
        return Rx.mergeStatic(recordStream, stateSwitch)
      }
    }
  }

  export interface Events {
    readonly started: Rx.Observable<Event>
    readonly stopped: Rx.Observable<Event>
    readonly dataAvailable: Rx.Observable<BlobEvent>
  }
  export namespace Events {
    export const create = (recorder: MediaRecorder): Events => ({
      started: Rx.fromEvent(recorder, 'start'),
      stopped: Rx.fromEvent(recorder, 'stop'),
      dataAvailable: Rx.fromEvent<BlobEvent>(recorder, 'dataavailable')
    })
  }
}
