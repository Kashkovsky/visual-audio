import { pipe } from 'fp-ts/es6/function'
import * as RTE from 'fp-ts/es6/ReaderTaskEither'
import * as TE from 'fp-ts/es6/TaskEither'

export interface SourceNode extends AudioNode {
  readonly mediaStream: MediaStream
}
/** AudioSourceNode factories */
export namespace SourceNode {
  /** Create @see SourceNode from user media (microphone or any other audio input device) */
  export const fromUserMedia: (
    constraints: MediaStreamConstraints
  ) => RTE.ReaderTaskEither<AudioContext, Error, SourceNode> = constr => ctx =>
    pipe(
      TE.tryCatch(
        () => navigator.mediaDevices.getUserMedia(constr),
        (e: Error) => new Error(e.message)
      ),
      TE.map(stream => ctx.createMediaStreamSource(stream))
    )

  /** Create @see SourceNode from HTML5 media element (video or audio) */
  export const fromElement =
    (element: HTMLMediaElement): RTE.ReaderTaskEither<AudioContext, Error, SourceNode> =>
    ctx =>
      TE.tryCatch(
        () => {
          const node = ctx.createMediaElementSource(element)
          return new Promise(res => (element.onplay = res)).then(() => ({
            ...node,
            mediaStream: element.captureStream()
          }))
        },
        (e: Error) => new Error(e.message)
      )
}
