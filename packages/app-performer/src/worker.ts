import { AnalysisData, AnimationStrategy, Dimensions, Rx, VAWorker } from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as RE from 'fp-ts/es6/ReaderEither'
import * as E from 'fp-ts/es6/Either'
import * as visuals from '@va/visuals'

const THREE = require('three')

const frequency = new Rx.Subject<AnalysisData.Frequency>()
const waveform = new Rx.Subject<AnalysisData.Waveform>()
const size = new Rx.Subject<Dimensions>()

const getAnimation: RE.ReaderEither<
  VAWorker.WorkerMessage.Start,
  Error,
  AnimationStrategy.Animation3D
> = ({ strategy, config }) =>
  pipe(
    visuals[strategy as keyof typeof visuals] as (c: any) => AnimationStrategy.AnimationFactory,
    E.fromNullable(new Error(`Failed to import strategy by name: ${strategy}`)),
    E.map(s => s(config)({ frequency, waveform }))
  )

const initialize = (
  canvas: THREE.OffscreenCanvas,
  {
    cameraOptions: { fov, near, far },
    dimensions,
    rendererOptions
  }: AnimationStrategy.Animation3D.RenderOptions
) => {
  void pipe(
    getAnimation({ kind: 'start', strategy: 'frequencyPlaneStrategy', config: {} }),
    E.fold(console.error, animation => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        fov,
        dimensions.width / dimensions.height,
        near,
        far
      )
      camera.position.z = 1
      scene.add(camera)
      const renderer = new THREE.WebGLRenderer({
        canvas,
        ...rendererOptions
      })
      canvas = Object.assign(canvas, { style: {} })
      renderer.setSize(dimensions.width, dimensions.height)

      Rx.mergeStatic(
        size.pipe(
          Rx.tap(size => {
            camera.aspect = size.width / size.height
            camera.updateProjectionMatrix()
            renderer.setSize(size.width, size.height)
          })
        ),
        animation({ scene, camera, renderer, canvas: canvas as HTMLCanvasElement }).pipe(
          Rx.tap(() => {
            renderer.render(scene, camera)
          })
        )
      ).subscribe()
    })
  )
}

const ctx = self
ctx.addEventListener('message', (e: MessageEvent<VAWorker.WorkerMessage>) => {
  switch (e.data.kind) {
    case 'init':
      console.log('[WORKER] init')
      initialize(e.data.canvas, e.data.options)
      break
    case 'frequency':
      frequency.next(e.data.data)
      break
    case 'size':
      console.log('[WORKER] size')
      size.next(e.data.dimensions)
      break
    default:
      break
  }
})
