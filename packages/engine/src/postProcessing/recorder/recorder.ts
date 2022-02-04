import { pipe } from 'fp-ts/es6/function'
import { IO } from 'fp-ts/es6/IO'
import { Event } from 'three'
import { Rx } from '../../rx'
import * as NEA from 'fp-ts/es6/NonEmptyArray'
import * as A from 'fp-ts/es6/Array'
import * as O from 'fp-ts/es6/Option'
import * as E from 'fp-ts/es6/Either'
import { fetchFile, FFmpeg as FF } from '@ffmpeg/ffmpeg'
export interface Recorder {
  readonly events: Recorder.Events
  readonly start: IO<void>
  readonly stop: IO<void>
  readonly record: (state: Rx.Observable<boolean>) => Rx.Observable<Uint8Array>
}

export namespace Recorder {
  export type FFMpeg = FF
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

  export const create =
    (ffmpeg: Rx.Observable<Recorder.FFMpeg>) =>
    (stream: MediaStream): E.Either<Error, Recorder> =>
      pipe(
        getSupportedMime(),
        E.map(mimeType => {
          console.log('MIME chosen', mimeType)
          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 3000000
          })
          const events = Recorder.Events.create(recorder)
          const name = 'recording.webm'
          return {
            events,
            start: () => recorder.start(3000),
            stop: () => recorder.stop(),
            record: state => {
              const recordStream = events.started.pipe(
                Rx.switchMap(() =>
                  events.dataAvailable.pipe(
                    Rx.map(e => e.data),
                    Rx.filter(data => data.size > 0),
                    Rx.bufferWhen(() => events.stopped),
                    Rx.take(1)
                  )
                ),
                Rx.map(
                  chunks =>
                    new Blob(chunks, {
                      type: mimeType.split(';')[0]
                    })
                ),
                Rx.switchMap(blob => Rx.from(fetchFile(blob))),
                Rx.withLatestFrom(ffmpeg),
                Rx.map(([file, ffmpeg]) => (ffmpeg.FS('writeFile', name, file), ffmpeg)),
                Rx.switchMap(ffmpeg =>
                  Rx.from(
                    ffmpeg.run(
                      '-i',
                      name,
                      'recording.mp4',
                      '-acodec',
                      'copy',
                      '-max_muxing_queue_size',
                      '9999',
                      '-vf',
                      'scale=640:480'
                    )
                  ).pipe(Rx.mapTo(ffmpeg))
                ),
                Rx.map(ffmpeg => ffmpeg.FS('readFile', 'recording.mp4')),
                Rx.tap(data => {
                  const blob = new Blob([data.buffer], {
                    type: 'video/mp4'
                  })

                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.setAttribute('style', 'display: none')
                  document.body.appendChild(a)
                  a.href = url
                  a.download = 'recording.mp4'
                  a.click()
                  window.URL.revokeObjectURL(url)
                })
              )
              const stateSwitch = state.pipe(
                Rx.tap(enabled =>
                  enabled && recorder.state !== 'recording'
                    ? recorder.start(3000)
                    : recorder.state !== 'inactive' && recorder.stop()
                ),
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
