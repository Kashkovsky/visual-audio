import {
  AnalysisData,
  AnimationStrategy,
  ElementProxyReceiver,
  ProxyManager,
  Rect,
  Rx,
  WorkerMessage
} from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as RE from 'fp-ts/es6/ReaderEither'
import * as E from 'fp-ts/es6/Either'
import * as visuals from './strategy'
import * as O from 'fp-ts/es6/Option'
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'

interface State {
  env: O.Option<AnimationStrategy.Animation3D.Environment>
  readonly frequency: Rx.Subject<AnalysisData.Frequency>
  readonly waveform: Rx.Subject<AnalysisData.Waveform>
  readonly size: Rx.Subject<Rect>
  proxy?: ElementProxyReceiver
}

const state: State = {
  env: O.none,
  frequency: new Rx.Subject<AnalysisData.Frequency>(),
  waveform: new Rx.Subject<AnalysisData.Waveform>(),
  size: new Rx.Subject<Rect>()
}

const getAnimation: RE.ReaderEither<WorkerMessage.Start, Error, AnimationStrategy.Animation3D> = ({
  strategy,
  config
}) =>
  pipe(
    visuals[strategy as keyof typeof visuals] as (c: any) => AnimationStrategy.AnimationFactory,
    E.fromNullable(new Error(`Failed to import strategy by name: ${strategy}`)),
    E.map(s => s(config)(state))
  )
const proxyManager = new ProxyManager()

const init = (
  canvas: THREE.OffscreenCanvas,
  {
    cameraOptions: { fov, near, far },
    rect,
    rendererOptions
  }: AnimationStrategy.Animation3D.RenderOptions,
  proxyId: number
) => {
  proxyManager.makeProxy(proxyId)
  state.proxy = proxyManager.getProxy(proxyId)
  state.proxy?.update(rect)

  // @ts-ignore
  self.window = state.proxy
  // @ts-ignore
  self.document = state.proxy
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, rect.width / rect.height, near, far)
  camera.position.z = 1
  const controls = new OrbitControls(camera, ElementProxyReceiver.asHTMLElement(state.proxy!))
  controls.target.set(0, 0, 0)
  controls.update()

  scene.add(camera)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    ...rendererOptions
  })
  canvas = Object.assign(canvas, { style: {} })
  renderer.setSize(rect.width, rect.height)

  state.size
    .pipe(
      Rx.tap(size => {
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
        state.proxy?.update(size)
        renderer.setSize(size.width, size.height)
      })
    )
    .subscribe()

  state.env = O.some({ renderer, scene, canvas, camera, controls })
}

const start = (message: WorkerMessage.Start) => {
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
        .pipe(
          Rx.tap(() => {
            env.controls.update()
            env.renderer.render(env.scene, env.camera)
          })
        )
        .subscribe()
    })
  )
}

const ctx = self
ctx.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  switch (e.data.kind) {
    case 'init':
      init(e.data.canvas, e.data.options, e.data.proxyId)
      break
    case 'frequency':
      state.frequency.next(e.data.data)
      break
    case 'waveform':
      state.waveform.next(e.data.data)
      break
    case 'size':
      state.size.next(e.data.rect)
      break
    case 'start':
      start(e.data)
      break
    case 'makeProxy':
      proxyManager.makeProxy(e.data.id)
      break
    case 'event':
      proxyManager.handleEvent(e.data)
      break
    default:
      break
  }
})
