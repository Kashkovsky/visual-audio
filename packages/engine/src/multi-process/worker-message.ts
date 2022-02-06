import { AnimationStrategy } from '../animation'
import { AnalysisData } from '../audio'
import { Rect } from '../geometry'

export type WorkerMessage<TCOnfig = unknown> =
  | WorkerMessage.Init
  | WorkerMessage.Frequency
  | WorkerMessage.Waveform
  | WorkerMessage.Size
  | WorkerMessage.Start<TCOnfig>
  | WorkerMessage.Event
  | WorkerMessage.MakeProxy

export namespace WorkerMessage {
  export interface Init {
    readonly kind: 'init'
    readonly proxyId: number
    readonly options: AnimationStrategy.Animation3D.RenderOptions
    readonly canvas: THREE.OffscreenCanvas
  }

  export namespace Init {
    export const create = (
      options: AnimationStrategy.Animation3D.RenderOptions,
      canvas: THREE.OffscreenCanvas,
      proxyId: number
    ): WorkerMessage.Init => ({
      kind: 'init',
      options,
      canvas,
      proxyId
    })
  }
  export interface Frequency {
    readonly kind: 'frequency'
    readonly data: AnalysisData.Frequency
  }

  export namespace Frequency {
    export const create = (data: AnalysisData.Frequency): WorkerMessage.Frequency => ({
      kind: 'frequency',
      data
    })
  }

  export interface Waveform {
    readonly kind: 'waveform'
    readonly data: AnalysisData.Waveform
  }

  export namespace Waveform {
    export const create = (data: AnalysisData.Waveform): WorkerMessage.Waveform => ({
      kind: 'waveform',
      data
    })
  }

  export interface Size {
    readonly kind: 'size'
    readonly rect: Rect
  }

  export namespace Size {
    export const create = (rect: Rect): WorkerMessage.Size => ({
      kind: 'size',
      rect
    })

    export const fromWindowSize = (): WorkerMessage.Size => ({
      kind: 'size',
      rect: {
        width: window.innerWidth,
        height: window.innerHeight,
        top: 0,
        bottom: window.innerHeight,
        left: 0,
        right: window.innerWidth
      }
    })
  }

  export interface Start<TCOnfig = unknown> {
    readonly kind: 'start'
    readonly strategy: string
    readonly config?: TCOnfig
  }

  export namespace Start {
    export const create = <TConfig = unknown>(
      strategy: string,
      config?: TConfig
    ): WorkerMessage.Start<TConfig> => ({
      kind: 'start',
      strategy,
      config
    })
  }

  export interface Event {
    readonly kind: 'event'
    readonly id: number
    readonly data: any
  }

  export namespace Event {
    export const create = (id: number, data: any): WorkerMessage.Event => ({
      kind: 'event',
      id,
      data
    })
  }

  export interface MakeProxy {
    readonly kind: 'makeProxy'
    readonly id: number
  }

  export namespace MakeProxy {
    export const create = (id: number): WorkerMessage.MakeProxy => ({
      kind: 'makeProxy',
      id
    })
  }
}
