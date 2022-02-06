import { AnalysisData } from '../audio'
import { Rect } from '../geometry'
import { flow } from 'fp-ts/es6/function'
import * as O from 'fp-ts/es6/Option'
import { WorkerMessage } from './worker-message'
import { AnimationStrategy } from '../animation'

export interface VAWorker {
  init: (
    options: AnimationStrategy.Animation3D.RenderOptions,
    canvas: THREE.OffscreenCanvas,
    proxyId: number
  ) => void
  resize: (rect?: Rect) => void
  frequency: (data: AnalysisData.Frequency) => void
  waveform: (data: AnalysisData.Waveform) => void
  startAnimation: (name: string, config?: unknown) => void
  sendEvent: (id: number, data: any) => void
}

export namespace VAWorker {
  export const create = (workerUrl: string): VAWorker => {
    const worker = new Worker(workerUrl, { type: 'module' })
    const send = (msg: WorkerMessage, options?: any) => worker.postMessage(msg, options)

    return {
      init: flow(WorkerMessage.Init.create, msg => send(msg, [msg.canvas])),
      resize: flow(
        O.fromNullable,
        O.map(WorkerMessage.Size.create),
        O.getOrElse(WorkerMessage.Size.fromWindowSize),
        send
      ),
      frequency: flow(WorkerMessage.Frequency.create, send),
      waveform: flow(WorkerMessage.Waveform.create, send),
      startAnimation: flow(WorkerMessage.Start.create, send),
      sendEvent: flow(WorkerMessage.Event.create, send)
    }
  }
}
