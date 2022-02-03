import { AnimationStrategy } from '../animation'
import { AnalysisData } from '../audio'
import * as THREE from 'three'
import { Dimensions } from '../geometry'
import { flow } from 'fp-ts/es6/function'
import * as O from 'fp-ts/es6/Option'
import { canvasToOffscreen } from '../utils'

export interface VAWorker {
  resize: (dimensions?: Dimensions) => void
  frequency: (data: AnalysisData.Frequency) => void
  waveform: (data: AnalysisData.Waveform) => void
  startAnimation: (name: string, config?: unknown) => void
}

export namespace VAWorker {
  export interface Config {
    readonly workerUrl: string
    readonly options: AnimationStrategy.Animation3D.RenderOptions
    readonly canvas: HTMLCanvasElement
  }
  export const create = ({ workerUrl, options, canvas }: VAWorker.Config): VAWorker => {
    const offscreen = canvasToOffscreen(canvas)
    const worker = new Worker(workerUrl, { type: 'module' })
    const send = (msg: VAWorker.WorkerMessage, options?: any) => worker.postMessage(msg, options)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    worker.postMessage(VAWorker.WorkerMessage.Init.create(options, offscreen), [offscreen as any])

    return {
      resize: flow(
        O.fromNullable,
        O.map(VAWorker.WorkerMessage.Size.create),
        O.getOrElse(VAWorker.WorkerMessage.Size.fromWindowSize),
        send
      ),
      frequency: flow(VAWorker.WorkerMessage.Frequency.create, send),
      waveform: flow(VAWorker.WorkerMessage.Waveform.create, send),
      startAnimation: flow(VAWorker.WorkerMessage.Start.create, send)
    }
  }
  export type WorkerMessage<TCOnfig = unknown> =
    | WorkerMessage.Init
    | WorkerMessage.Frequency
    | WorkerMessage.Waveform
    | WorkerMessage.Size
    | WorkerMessage.Start<TCOnfig>

  export namespace WorkerMessage {
    export interface Init {
      readonly kind: 'init'
      readonly options: AnimationStrategy.Animation3D.RenderOptions
      readonly canvas: THREE.OffscreenCanvas
    }

    export namespace Init {
      export const create = (
        options: AnimationStrategy.Animation3D.RenderOptions,
        canvas: THREE.OffscreenCanvas
      ): VAWorker.WorkerMessage.Init => ({
        kind: 'init',
        options,
        canvas
      })
    }
    export interface Frequency {
      readonly kind: 'frequency'
      readonly data: AnalysisData.Frequency
    }

    export namespace Frequency {
      export const create = (data: AnalysisData.Frequency): VAWorker.WorkerMessage.Frequency => ({
        kind: 'frequency',
        data
      })
    }

    export interface Waveform {
      readonly kind: 'waveform'
      readonly data: AnalysisData.Waveform
    }

    export namespace Waveform {
      export const create = (data: AnalysisData.Waveform): VAWorker.WorkerMessage.Waveform => ({
        kind: 'waveform',
        data
      })
    }

    export interface Size {
      readonly kind: 'size'
      readonly dimensions: Dimensions
    }

    export namespace Size {
      export const create = (dimensions: Dimensions): VAWorker.WorkerMessage.Size => ({
        kind: 'size',
        dimensions
      })

      export const fromWindowSize = (): VAWorker.WorkerMessage.Size => ({
        kind: 'size',
        dimensions: { width: window.innerWidth, height: window.innerHeight }
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
      ): VAWorker.WorkerMessage.Start<TConfig> => ({
        kind: 'start',
        strategy,
        config
      })
    }
  }
}
