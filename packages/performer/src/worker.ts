import { AnalysisData, AnimationStrategy, Dimensions, Rx, VAWorker } from '@va/engine'
import { frequencyPlaneStrategy } from '@va/visuals'
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'

const frequency = new Rx.Subject<AnalysisData.Frequency>()
const waveform = new Rx.Subject<AnalysisData.Waveform>()
const size = new Rx.Subject<Dimensions>()
const strategy = frequencyPlaneStrategy({})({ frequency, waveform })

const initialize = (
  canvas: THREE.OffscreenCanvas,
  {
    cameraOptions: { fov, near, far },
    dimensions,
    rendererOptions
  }: AnimationStrategy.Animation3D.RenderOptions
) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, dimensions.width / dimensions.height, near, far)
  camera.position.z = 1
  scene.add(camera)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    ...rendererOptions
  })
  canvas = Object.assign(canvas, { style: {} })
  renderer.setSize(dimensions.width, dimensions.height)
  const controls = new OrbitControls(camera, renderer.domElement)

  Rx.mergeStatic(
    size.pipe(
      Rx.tap(size => {
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
        renderer.setSize(size.width, size.height)
      })
    ),
    strategy({ scene, camera, renderer, controls, canvas: canvas as HTMLCanvasElement }).pipe(
      Rx.tap(() => {
        controls.update()
        renderer.render(scene, camera)
      })
    )
  ).subscribe()
}

addEventListener('message', (e: MessageEvent<VAWorker.WorkerMessage>) => {
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
