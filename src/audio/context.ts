import { Lazy, pipe } from 'fp-ts/lib/function'
import * as R from 'fp-ts/es6/Reader'
import * as TE from 'fp-ts/es6/TaskEither'
import * as RTE from 'fp-ts/es6/ReaderTaskEither'
import Rx from '../rx'
import { FRAMES } from '../animation'
import * as E from 'fp-ts/es6/Either'

export interface Sound {
  readonly context: Rx.Observable<AudioContext>
  readonly state: Rx.Observable<any>
}

export namespace Sound {
  export type AnalysisData = Uint8Array
  const ctor =
    window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext) ||
    ((window as any).mozAudioContext as AudioContext)
  export const create: Lazy<Sound> = () => {
    const context = new ctor()
    const observableContext =
      context.state !== 'running'
        ? Rx.fromEvent(document, 'mousedown').pipe(
            Rx.switchMap(() => {
              if (context.state !== 'running') {
                console.log('Resuming AudioContext on user interaction')
                return Rx.from(context.resume()).pipe(Rx.mapTo(context))
              }

              return Rx.of(context)
            })
          )
        : Rx.of(context)

    return {
      context: observableContext,
      state: Rx.fromEvent(context, 'onstatechange')
    }
  }

  export const createFor = <T>(logic: R.Reader<AudioContext, Rx.Observable<T>>): Rx.Observable<T> =>
    create().context.pipe(Rx.switchMap(logic))

  export namespace UserMedia {
    export const create: RTE.ReaderTaskEither<MediaStreamConstraints, Error, MediaStream> =
      constr =>
        TE.tryCatch(
          () => navigator.mediaDevices.getUserMedia(constr),
          (e: Error) => new Error(e.message)
        )
  }

  export interface AnalysedNode<T extends AudioNode = AudioNode> {
    readonly node: T
    readonly analyser: AnalyserNode
    readonly timeDomain: Rx.Observable<AnalysisData>
    readonly frequency: Rx.Observable<AnalysisData>
  }

  export namespace AnalysedNode {
    export interface AnalyserConfig {
      readonly minDecibels: number
      readonly maxDecibels: number
      readonly smoothingTimeConstant?: number
      readonly fftSize?: number
    }

    export const connectToSource =
      (analyser: AnalysedNode<AnalyserNode>) =>
      (source: AudioNode): AnalysedNode => ({
        ...analyser,
        node: source.connect(analyser.node)
      })

    export const connectToDestination =
      (dest: AudioNode) =>
      (analyser: AnalysedNode<AnalyserNode>): AnalysedNode => ({
        ...analyser,
        node: analyser.node.connect(dest)
      })

    export const create =
      ({ maxDecibels, minDecibels, smoothingTimeConstant = 0.85, fftSize = 512 }: AnalyserConfig) =>
      (ctx: AudioContext): AnalysedNode<AnalyserNode> => {
        const node = ctx.createAnalyser()
        node.minDecibels = minDecibels
        node.maxDecibels = maxDecibels
        node.smoothingTimeConstant = smoothingTimeConstant
        node.fftSize = fftSize

        const timeDomain = FRAMES.pipe(
          Rx.scan(acc => (node.getByteTimeDomainData(acc), acc), new Uint8Array(node.fftSize))
        )

        const frequency = FRAMES.pipe(
          Rx.scan(acc => (node.getByteFrequencyData(acc), acc), new Uint8Array(node.fftSize))
        )

        return { node, timeDomain, frequency, analyser: node }
      }

    export const fromUserMedia = (config: AnalyserConfig) => (ctx: AudioContext) =>
      pipe(
        UserMedia.create({ audio: true }),
        TE.map(stream => ctx.createMediaStreamSource(stream)),
        TE.map(pipe(ctx, create(config), connectToSource))
      )

    export const fromUserMediaToOut =
      (config: AnalyserConfig) =>
      (ctx: AudioContext): Rx.Observable<Sound.AnalysedNode> =>
        pipe(
          ctx,
          fromUserMedia(config),
          TE.map(Sound.AnalysedNode.connectToDestination(ctx.destination)),
          t => Rx.from(t()),
          Rx.switchMap(
            E.fold(
              err => {
                console.error(err)
                return Rx.EMPTY
              },
              node => Rx.of(node)
            )
          )
        )

    export const attachAnimation =
      (animation: R.Reader<AnalysedNode, Rx.Observable<AnalysisData>>) =>
      (analyzedNode: Rx.Observable<AnalysedNode>) =>
        analyzedNode.pipe(Rx.switchMap(animation))
  }
}
