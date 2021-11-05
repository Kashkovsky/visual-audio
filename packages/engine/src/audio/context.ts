import { Lazy, pipe } from 'fp-ts/es6/function'
import * as R from 'fp-ts/es6/Reader'
import * as TE from 'fp-ts/es6/TaskEither'
import * as RTE from 'fp-ts/es6/ReaderTaskEither'
import Rx from '../rx'
import { FRAMES } from '../animation'
import * as E from 'fp-ts/es6/Either'
import { AnalysisData } from './analysis-data'
import * as O from 'fp-ts/es6/Option'
import { AnimationStrategy } from '~strategy'

export interface Sound {
  readonly context: Rx.Observable<AudioContext>
  readonly state: Rx.Observable<AudioContextState>
}

export namespace Sound {
  const ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: AudioContext }).webkitAudioContext ||
    (window as unknown as { mozAudioContext: AudioContext }).mozAudioContext
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
      state: Rx.fromEvent<AudioContextState>(context, 'onstatechange')
    }
  }

  export const createFor = <T>(logic: R.Reader<AudioContext, Rx.Observable<T>>): Rx.Observable<T> =>
    Sound.create().context.pipe(Rx.switchMap(logic))

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
    readonly stream: O.Option<MediaStream>
    readonly analyser: AnalyserNode
    readonly waveform: Rx.Observable<AnalysisData.Waveform>
    readonly frequency: Rx.Observable<AnalysisData.Frequency>
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace AnalysedNode {
    export interface AnalyserConfig {
      readonly minDecibels: number
      readonly maxDecibels: number
      readonly smoothingTimeConstant?: number
      readonly fftSize?: number
    }

    export const connectToSource =
      (analyser: AnalysedNode<AnalyserNode>) =>
      (source: MediaStreamAudioSourceNode): AnalysedNode => ({
        ...analyser,
        stream: O.some(source.mediaStream),
        node: source.connect(analyser.node)
      })

    export const connectToDestination =
      (destination: AudioNode) =>
      (analyser: AnalysedNode<AudioNode>): AnalysedNode => ({
        ...analyser,
        node: analyser.node.connect(destination)
      })

    export const create =
      ({ maxDecibels, minDecibels, smoothingTimeConstant = 0.85, fftSize = 512 }: AnalyserConfig) =>
      (ctx: AudioContext): AnalysedNode<AnalyserNode> => {
        const node = ctx.createAnalyser()
        node.minDecibels = minDecibels
        node.maxDecibels = maxDecibels
        node.smoothingTimeConstant = smoothingTimeConstant
        node.fftSize = fftSize

        const waveform = FRAMES.pipe(
          Rx.scan(
            acc => (node.getByteTimeDomainData(acc), acc),
            AnalysisData.Waveform.create(node.fftSize)
          )
        )

        const frequency = FRAMES.pipe(
          Rx.scan(
            acc => (node.getByteFrequencyData(acc), acc),
            AnalysisData.Frequency.create(node.fftSize)
          )
        )

        return { node, waveform: waveform, frequency, analyser: node, stream: O.none }
      }

    export const fromUserMedia =
      (config: AnalyserConfig) =>
      (ctx: AudioContext): TE.TaskEither<Error, AnalysedNode<AudioNode>> =>
        pipe(
          UserMedia.create({
            audio: {
              latency: 0,
              echoCancellation: false
            }
          }),
          TE.map(stream => ctx.createMediaStreamSource(stream)),
          TE.map(pipe(ctx, AnalysedNode.create(config), AnalysedNode.connectToSource))
        )

    export const fromUserMediaToOut =
      (config: AnalyserConfig) =>
      (ctx: AudioContext): Rx.Observable<Sound.AnalysedNode> =>
        pipe(
          ctx,
          AnalysedNode.fromUserMedia(config),
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
      (animation: R.Reader<AnalysedNode, AnimationStrategy<AnimationStrategy.Animation>>) =>
      (
        analyzedNode: Rx.Observable<AnalysedNode>
      ): Rx.Observable<AnimationStrategy<AnimationStrategy.Animation>> =>
        analyzedNode.pipe(Rx.map(animation))
  }
}
