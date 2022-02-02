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
}

export namespace VAWorker {
  export interface Config {
    readonly worker: Worker
    readonly options: AnimationStrategy.Animation3D.RenderOptions
    readonly canvas: HTMLCanvasElement
  }
  export const create = ({ worker, options, canvas }: VAWorker.Config): VAWorker => {
    const offscreen = canvasToOffscreen(canvas)
    const send = (msg: VAWorker.WorkerMessage, options?: any) =>
      worker.postMessage(msg, options)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    worker.postMessage(VAWorker.WorkerMessage.Init.create(options, offscreen), [offscreen as any])

    return {
      resize: flow(
        O.fromNullable,
        O.map(VAWorker.WorkerMessage.Size.create),
        O.getOrElse(VAWorker.WorkerMessage.Size.fromWindowSize),
        send
      ),
      frequency: flow(VAWorker.WorkerMessage.Frequency.create, send)
    }
  }
  export type WorkerMessage = WorkerMessage.Init | WorkerMessage.Frequency | WorkerMessage.Size

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
  }
}