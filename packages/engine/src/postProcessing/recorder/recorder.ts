import { pipe } from 'fp-ts/es6/function'
import { IO } from 'fp-ts/es6/IO'
import { Event } from 'three'
import { Rx } from '../../rx'
import * as NEA from 'fp-ts/es6/NonEmptyArray'
import * as A from 'fp-ts/es6/Array'
import * as O from 'fp-ts/es6/Option'
import * as E from 'fp-ts/es6/Either'

export interface Recorder {
  readonly events: Recorder.Events
  readonly start: IO<void>
  readonly stop: IO<void>
  readonly record: (state: Rx.Observable<boolean>) => Rx.Observable<Blob[]>
}

export namespace Recorder {
  const types = {
    audio: ['webm', 'ogg', 'mp3'],
    video: ['webm', 'ogg', 'mp4']
  }

  const preferableTypes: NEA.NonEmptyArray<string> = [
    'video/mp4;codecs:h.264',
    'video/webm;codecs:h.264'
  ]

  const codecs = [
    'vp9',
    'vp9.0',
    'vp8',
    'vp8.0',
    'avc1',
    'av1',
    'h265',
    'h.265',
    'h264',
    'h.264',
    'opus',
    'pcm',
    'aac',
    'mpeg',
    'mp4a'
  ]
  const getSupportedMime = () =>
    pipe(
      getSupportedMimeTypes('video'),
      NEA.fromArray,
      O.chain(supported =>
        pipe(
          preferableTypes,
          A.filter(t => supported.includes(t)),
          A.head
        )
      ),
      E.fromOption(() => new Error('Could not find any supported MIME type'))
    )

  export const create = (stream: MediaStream): E.Either<Error, Recorder> =>
    pipe(
      getSupportedMime(),
      E.map(mimeType => {
        console.log('MIME chosen', mimeType)
        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 5000000
        })
        const events = Recorder.Events.create(recorder)

        return {
          events,
          start: () => recorder.start(3000),
          stop: () => recorder.stop(),
          record: state => {
            console.log('Record idle, waiting to start')
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
                  type: mimeType.split(';')[0]
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
              Rx.tap(enabled => (enabled ? recorder.start(3000) : recorder.stop())),
              Rx.ignoreElements()
            )
            return Rx.mergeStatic(recordStream, stateSwitch)
          }
        }
      })
    )

  function getSupportedMimeTypes(media: 'video' | 'audio') {
    const supported: string[] = []
    types[media].forEach(type => {
      const mimeType = `${media}/${type}`
      codecs.forEach(codec =>
        [
          `${mimeType};codecs=${codec}`,
          `${mimeType};codecs:${codec}`,
          `${mimeType};codecs=${codec.toUpperCase()}`,
          `${mimeType};codecs:${codec.toUpperCase()}`
        ].forEach(variation => {
          if (MediaRecorder.isTypeSupported(variation)) supported.push(variation)
        })
      )
      if (MediaRecorder.isTypeSupported(mimeType)) supported.push(mimeType)
    })
    return supported
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
