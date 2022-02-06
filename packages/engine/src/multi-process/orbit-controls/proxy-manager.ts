import { constVoid } from 'fp-ts/es6/function'
import { Rect } from '../../geometry'
import * as THREE from 'three'

export class ElementProxyReceiver extends THREE.EventDispatcher {
  width: number
  height: number
  top: number
  left: number
  bottom: number
  right: number
  body = this
  constructor() {
    super()
  }

  get clientWidth() {
    return this.width
  }
  get clientHeight() {
    return this.height
  }
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height
    }
  }

  update(data: Rect) {
    this.left = data.left
    this.top = data.top
    this.width = data.width
    this.height = data.height
    this.right = data.right
    this.bottom = data.bottom
  }
  handleEvent(data: Event) {
    data.preventDefault = constVoid
    data.stopPropagation = constVoid
    this.dispatchEvent(data)
  }
  focus() {}

  static asHTMLElement = (p: ElementProxyReceiver) => p as unknown as HTMLElement
}

export class ProxyManager {
  private _targets = new Map<number, ElementProxyReceiver>()
  constructor() {
    this.handleEvent = this.handleEvent.bind(this)
  }
  makeProxy(id: number) {
    const proxy = new ElementProxyReceiver()
    this._targets.set(id, proxy)
  }
  getProxy(id: number) {
    return this._targets.get(id)
  }
  handleEvent(data: any) {
    this._targets.get(data.id)?.handleEvent(data.data)
  }
}
