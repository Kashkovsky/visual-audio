import type { GUI as DATGUI } from 'dat.gui'
import { VAWorkerClient } from '../va-worker/va-worker-client'
import { Rx } from '../../rx'
import { TransportMessage } from '../transport-message'

export namespace GUIClient {
  export const create = (gui: DATGUI, worker: VAWorkerClient): Rx.Observable<never> =>
    worker.messages.pipe(
      Rx.filter(TransportMessage.Worker.CreateGUI.is),
      Rx.scan((props, msg) => {
        const name = msg.label ?? msg.property
        const state = {
          [name]: msg.initialValue
        }
        const sub = new Rx.Subject<[string, any]>()
        props.set(msg.property, sub)
        gui
          .add(state, name, msg.min, msg.max)
          .onFinishChange(() => sub.next([msg.property, state[name]]))
          .listen()
        return props
      }, new Map<string, Rx.Subject<[string, any]>>()),
      Rx.switchMap(props =>
        Rx.mergeStatic<[string, any][]>(...props.values()).pipe(Rx.debounceTime(100))
      ),
      Rx.tap(([property, value]) => worker.sendPropertyUpdate(property, value)),
      Rx.ignoreElements()
    )
}
