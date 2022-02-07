import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent'
import { VAWorkerClient } from '../va-worker/va-worker-client'
import { eventHandlers, HandledEvent } from './event-handlers'

export namespace ElementProxy {
  let nextProxyId = 0
  export const create = (
    worker: VAWorkerClient,
    element: HasEventTargetAddRemove<Event> = document
  ): number => {
    const id = nextProxyId++
    const sendEvent = (data: any) => worker.sendEvent(id, data)

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function (event: Event) {
        handler(event as HandledEvent, sendEvent)
      })
    }

    return id
  }
}
