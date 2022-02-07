import { AnalysisData } from '../../audio'
import { Rect } from '../../geometry'
import { pipe } from 'fp-ts/es6/function'
import * as O from 'fp-ts/es6/Option'
import { TransportMessage } from '../transport-message'
import { AnimationStrategy } from '../../animation'
import { Rx } from '../../rx'
import { ElementProxyReceiver, ProxyManager } from '../orbit-controls'
import * as THREE from 'three'
import * as RE from 'fp-ts/es6/ReaderEither'
import { OrbitControls } from 'three-orbitcontrols-ts'
import * as E from 'fp-ts/es6/Either'
import { GUIWorker } from '../gui/gui-worker'

export namespace VAWorkerInstance {
  interface State {
    env: O.Option<AnimationStrategy.Animation3D.Environment>
    readonly frequency: Rx.Subject<AnalysisData.Frequency>
    readonly waveform: Rx.Subject<AnalysisData.Waveform>
    readonly size: Rx.Subject<Rect>
    proxy?: ElementProxyReceiver
  }

  // FIXME: Hacky code bellow
  export const createInstance = (
    getAnimation: RE.ReaderEither<
      TransportMessage.UI.Start,
      Error,
      AnimationStrategy.AnimationFactory
    >
  ): ((e: MessageEvent<TransportMessage.UI>) => void) => {
    const proxyManager = new ProxyManager()
    const gui = GUIWorker.create()
    const state: State = {
      env: O.none,
      frequency: new Rx.Subject<AnalysisData.Frequency>(),
      waveform: new Rx.Subject<AnalysisData.Waveform>(),
      size: new Rx.Subject<Rect>()
    }

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

      state.env = O.some({ renderer, scene, canvas, camera, controls, gui })
    }

    const start = (message: TransportMessage.UI.Start) => {
      void pipe(
        getAnimation(message),
        E.chain(factory =>
          pipe(
            state.env,
            E.fromOption(() => new Error('Scene is not initialized')),
            E.map(env => ({ env, animation: factory(state) }))
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

    return (e: MessageEvent<TransportMessage.UI>) => {
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
        case 'event':
          proxyManager.handleEvent(e.data)
          break
        case 'update-property':
          gui.update(e.data.property, e.data.value)
          break
        default:
          break
      }
    }
  }
}
