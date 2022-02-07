export type HandledEvent = Event & TouchEvent & WheelEvent & KeyboardEvent

const mouseEventHandler = makeSendPropertiesHandler<MouseEvent>([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'clientX',
  'clientY',
  'pageX',
  'pageY'
])
const wheelEventHandlerImpl = makeSendPropertiesHandler<WheelEvent>([
  'deltaX',
  'deltaY',
  'deltaZ',
  'clientX',
  'clientY',
  'deltaMode'
])
const keydownEventHandler = makeSendPropertiesHandler<KeyboardEvent>([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'keyCode',
  'key'
])

type SendFn = (data: Event) => void

function wheelEventHandler(event: WheelEvent, sendFn: SendFn) {
  event.preventDefault()
  wheelEventHandlerImpl(event, sendFn)
}

function preventDefaultHandler(event: Event) {
  event.preventDefault()
}

function copyProperties<T extends Event>(
  src: T,
  properties: (keyof T)[],
  dst: Record<keyof T, any>
) {
  for (const name of properties) {
    dst[name] = src[name]
  }
}

function makeSendPropertiesHandler<T extends Event>(properties: (keyof T)[]) {
  return function sendProperties(event: T, sendFn: SendFn) {
    const data: any = { type: event.type }
    copyProperties(event, properties, data)
    sendFn(data)
  }
}

function touchEventHandler(event: TouchEvent, sendFn: Function) {
  const touches: { pageX: number; pageY: number }[] = []
  const data = { type: event.type, touches }
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i]
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY
    })
  }
  sendFn(data)
}

function filteredKeydownEventHandler(event: KeyboardEvent, sendFn: SendFn) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    keydownEventHandler(event, sendFn)
  }
}

export const eventHandlers = {
  contextmenu: preventDefaultHandler,
  mousedown: mouseEventHandler,
  mousemove: mouseEventHandler,
  mouseup: mouseEventHandler,
  touchstart: touchEventHandler,
  touchmove: touchEventHandler,
  touchend: touchEventHandler,
  wheel: wheelEventHandler,
  keydown: filteredKeydownEventHandler
}
