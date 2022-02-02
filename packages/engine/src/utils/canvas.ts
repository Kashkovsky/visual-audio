export const canvasToOffscreen = (canvas: HTMLCanvasElement): THREE.OffscreenCanvas => {
  if (!('transferControlToOffscreen' in canvas)) {
    throw new Error('OffscreenCanvas is not supported')
  }
  return (
    canvas as unknown as { transferControlToOffscreen: () => THREE.OffscreenCanvas }
  ).transferControlToOffscreen()
}
