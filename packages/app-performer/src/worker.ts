import { AnalysisData, AnimationStrategy, Dimensions, Rx, VAWorker } from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as RE from 'fp-ts/es6/ReaderEither'
import * as E from 'fp-ts/es6/Either'
import * as visuals from '@va/visuals'
import * as O from 'fp-ts/es6/Option'
const THREE = require('three')

interface State {
  env: O.Option<AnimationStrategy.Animation3D.Environment>
  readonly frequency: Rx.Subject<AnalysisData.Frequency>
  readonly waveform: Rx.Subject<AnalysisData.Waveform>
  readonly size: Rx.Subject<Dimensions>
}

const state: State = {
  env: O.none,
  frequency: new Rx.Subject<AnalysisData.Frequency>(),
  waveform: new Rx.Subject<AnalysisData.Waveform>(),
  size: new Rx.Subject<Dimensions>()
}

const getAnimation: RE.ReaderEither<
  VAWorker.WorkerMessage.Start,
  Error,
  AnimationStrategy.Animation3D
> = ({ strategy, config }) =>
  pipe(
    visuals[strategy as keyof typeof visuals] as (c: any) => AnimationStrategy.AnimationFactory,
    E.fromNullable(new Error(`Failed to import strategy by name: ${strategy}`)),
    E.map(s => s(config)(state))
  )

const init = (
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

  state.size
    .pipe(
      Rx.tap(size => {
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
        renderer.setSize(size.width, size.height)
      })
    )
    .subscribe()

  state.env = O.some({ renderer, scene, canvas, camera })
}

const start = (message: VAWorker.WorkerMessage.Start) => {
  void pipe(
    getAnimation(message),
    E.chain(animation =>
      pipe(
        state.env,
        E.fromOption(() => new Error('Scene is not initialized')),
        E.map(env => ({ env, animation }))
      )
    ),
    E.fold(console.error, ({ animation, env }) => {
      animation(env)
        .pipe(Rx.tap(() => env.renderer.render(env.scene, env.camera)))
        .subscribe()
    })
  )
}

const ctx = self
ctx.addEventListener('message', (e: MessageEvent<VAWorker.WorkerMessage>) => {
  switch (e.data.kind) {
    case 'init':
      init(e.data.canvas, e.data.options)
      break
    case 'frequency':
      state.frequency.next(e.data.data)
      break
    case 'size':
      state.size.next(e.data.dimensions)
      break
    case 'start':
      start(e.data)
      break
    default:
      break
  }
})
