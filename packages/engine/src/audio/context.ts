import { flow, identity, Lazy, pipe } from 'fp-ts/es6/function'
import * as R from 'fp-ts/es6/Reader'
import * as TE from 'fp-ts/es6/TaskEither'
import * as RTE from 'fp-ts/es6/ReaderTaskEither'
import { Rx } from '../rx'
import { FRAMES } from '../animation'
import * as E from 'fp-ts/es6/Either'
import { AnalysisData } from './analysis-data'
import * as O from 'fp-ts/es6/Option'
import { AnimationStrategy } from '../animation/interfaces'
import { SourceNode } from './source-node'

export interface Sound {
  readonly context: Rx.Observable<AudioContext>
  readonly state: Rx.Observable<AudioContextState>
}

export namespace Sound {
  const ctor = self
    ? self.AudioContext ||
      (self as unknown as { webkitAudioContext: AudioContext }).webkitAudioContext ||
      (self as unknown as { mozAudioContext: AudioContext }).mozAudioContext
    : null
  export const create: Lazy<Sound> = () => {
    if (!ctor) {
      throw new Error('No context')
    }
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
    Sound.create().context.pipe(Rx.switchMap(logic), Rx.share())

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
      readonly mute?: boolean
    }

    export const connectToSource =
      (analyser: AnalysedNode<AnalyserNode>) =>
      (source: SourceNode): AnalysedNode => ({
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

    /** Asynchronously creates AnalysedNode from user media when it becomes available (user granted access) */
    export const fromUserMedia =
      (
        config: AnalyserConfig
      ): RTE.ReaderTaskEither<AudioContext, Error, AnalysedNode<AudioNode>> =>
      ctx =>
        pipe(
          ctx,
          SourceNode.fromUserMedia({
            audio: {
              latency: 0,
              echoCancellation: false
            }
          }),
          TE.map(pipe(ctx, AnalysedNode.create(config), AnalysedNode.connectToSource))
        )

    /** Asynchronously creates AnalysedNode from media element (audio or video) when it starts playing */
    export const fromElement =
      (
        element: HTMLMediaElement,
        config: AnalyserConfig
      ): RTE.ReaderTaskEither<AudioContext, Error, Sound.AnalysedNode> =>
      ctx =>
        pipe(
          ctx,
          SourceNode.fromElement(element),
          TE.map(pipe(ctx, AnalysedNode.create(config), AnalysedNode.connectToSource))
        )

    const connectToOut = (
      config: AnalyserConfig,
      ctx: AudioContext
    ): R.Reader<TE.TaskEither<Error, AnalysedNode<AudioNode>>, Rx.Observable<Sound.AnalysedNode>> =>
      flow(
        TE.map(config.mute ? identity : Sound.AnalysedNode.connectToDestination(ctx.destination)),
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
    /**
     * Creates and observable AnalysedNode from user media (e.g., microphone). It will emit when the user grants access.
     * Connects the node to AudioContext destination unless mute is set to true.
     */
    export const fromUserMediaToOut =
      (config: AnalyserConfig) =>
      (ctx: AudioContext): Rx.Observable<Sound.AnalysedNode> =>
        pipe(ctx, AnalysedNode.fromUserMedia(config), connectToOut(config, ctx))

    /**
     * Creates and observable AnalysedNode from media element (audio or video). It will emit when the element starts playing.
     * Connects the node to AudioContext destination unless mute is set to true.
     */
    export const fromElementToOut =
      (element: HTMLMediaElement, config: AnalyserConfig) =>
      (ctx: AudioContext): Rx.Observable<Sound.AnalysedNode> =>
        pipe(ctx, AnalysedNode.fromElement(element, config), connectToOut(config, ctx))

    /** Attaches animation strategy to AnalysedNode */
    export const attachAnimation =
      (animation: R.Reader<AnalysedNode, AnimationStrategy>) =>
      (analyzedNode: Rx.Observable<AnalysedNode>): Rx.Observable<AnimationStrategy> =>
        analyzedNode.pipe(Rx.map(animation))
  }
}
