import { pipe } from 'fp-ts/es6/function'
import { IO } from 'fp-ts/es6/IO'
import * as O from 'fp-ts/es6/Option'

export const createCanvas: IO<HTMLCanvasElement> = () =>
  pipe(
    document.getElementsByTagName('canvas').item(0),
    O.fromNullable,
    O.getOrElse(() => {
      const canvas = document.createElement('canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      document.body.prepend(canvas)
      return canvas
    })
  )

export const canvasToOffscreen = (canvas: HTMLCanvasElement): THREE.OffscreenCanvas => {
  if (!('transferControlToOffscreen' in canvas)) {
    throw new Error('OffscreenCanvas is not supported')
  }
  return (
    canvas as unknown as { transferControlToOffscreen: () => THREE.OffscreenCanvas }
  ).transferControlToOffscreen()
}
