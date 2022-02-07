import { AnalysisData } from '../../audio'
import { Rect } from '../../geometry'
import { flow } from 'fp-ts/es6/function'
import * as O from 'fp-ts/es6/Option'
import { TransportMessage } from '../transport-message'
import { AnimationStrategy } from '../../animation'
import { Rx } from '../../rx'
import * as THREE from 'three'

export interface VAWorkerClient {
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
  sendPropertyUpdate: (property: string, value: any) => void
  messages: Rx.Observable<TransportMessage.Worker>
}

export namespace VAWorkerClient {
  export const createClient = (workerUrl: string): VAWorkerClient => {
    const worker = new Worker(workerUrl, { type: 'module' })
    const send = (msg: TransportMessage.UI, options?: any) => worker.postMessage(msg, options)
    return {
      init: flow(TransportMessage.UI.Init.create, msg => send(msg, [msg.canvas])),
      resize: flow(
        O.fromNullable,
        O.map(TransportMessage.UI.Size.create),
        O.getOrElse(TransportMessage.UI.Size.fromWindowSize),
        send
      ),
      frequency: flow(TransportMessage.UI.Frequency.create, send),
      waveform: flow(TransportMessage.UI.Waveform.create, send),
      startAnimation: flow(TransportMessage.UI.Start.create, send),
      sendEvent: flow(TransportMessage.UI.Event.create, send),
      sendPropertyUpdate: flow(TransportMessage.UI.UpdateProperty.create, send),
      messages: Rx.fromEvent<MessageEvent<TransportMessage.Worker>>(worker, 'message').pipe(
        Rx.map(e => e.data),
        Rx.shareReplay({ refCount: false, bufferSize: 1 })
      )
    }
  }
}
