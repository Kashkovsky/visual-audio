import { VAWorker } from 'multi-process'
import { eventHandlers, HandledEvent } from './event-handlers'

export namespace ElementProxy {
  let nextProxyId = 0
  export const create = (worker: VAWorker): number => {
    const id = nextProxyId++
    const sendEvent = (data: any) => worker.sendEvent(id, data)

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      document.addEventListener(eventName, function (event: Event) {
        handler(event as HandledEvent, sendEvent)
      })
    }

    return id
  }
}
