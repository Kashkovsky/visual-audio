import { AnalysisData, Sound } from '../audio'
import * as R from 'fp-ts/es6/Reader'
import { pipe } from 'fp-ts/es6/function'
import { Rx } from '../rx'
import Konva from 'konva'
import * as THREE from 'three'
import * as O from 'fp-ts/es6/Option'
import { OrbitControls } from 'three-orbitcontrols-ts'
import { Dimensions } from '../geometry'
export interface AnimationStrategy<Animation extends AnimationStrategy.Animation> {
  readonly animation: Animation
  readonly analyser: Sound.AnalysedNode
}

export interface BackgroundAnimationStrategy<Animation extends AnimationStrategy.Animation> {
  readonly animation: Animation
  readonly data: AnalysisData.Combined
}

export namespace AnimationStrategy {
  export type Animation2D = R.Reader<Konva.Stage, Rx.Observable<void>>
  export type Animation3D = R.Reader<Animation3D.Environment, Rx.Observable<void>>
  export type Animation = Animation2D | Animation3D
  export type AnimationFactory<Animation extends AnimationStrategy.Animation> = R.Reader<
    Sound.AnalysedNode,
    Animation
  >
  export type BackgroundAnimationFactory<Animation extends AnimationStrategy.Animation> = R.Reader<
    AnalysisData.Combined,
    Animation
  >
  export const create =
    <Animation extends AnimationStrategy.Animation>(
      animationFactory: AnimationFactory<Animation>
    ) =>
    (analyser: Sound.AnalysedNode): AnimationStrategy<Animation> => ({
      animation: animationFactory(analyser),
      analyser
    })

  export const createBackground =
    <Animation extends AnimationStrategy.Animation>(
      animationFactory: R.Reader<AnalysisData.Combined, Animation>
    ) =>
    (data: AnalysisData.Combined): BackgroundAnimationStrategy<Animation> => ({
      animation: animationFactory(data),
      data
    })

  export namespace Animation2D {
    export const toStage =
      () =>
      (strategy: Rx.Observable<AnimationStrategy<Animation2D>>): Rx.Observable<MediaStream> =>
        strategy.pipe(
          Rx.switchMap(strategy => {
            const stage = new Konva.Stage({
              container: 'root',
              width: window.innerWidth,
              height: window.innerHeight
            })

            const stream = stage.bufferCanvas._canvas.captureStream(60)
            pipe(
              strategy.analyser.stream,
              O.map(audioStream => {
                audioStream.getAudioTracks().forEach(track => stream.addTrack(track))
              })
            )

            return strategy.animation(stage).pipe(Rx.ignoreElements(), Rx.startWith(stream))
          })
        )

    export const chain =
      (animationFactory: AnimationFactory<Animation2D>) =>
      (a: AnimationStrategy<Animation2D>): AnimationStrategy<Animation2D> => ({
        animation: pipe(
          a.animation,
          R.chain(obs => stage => Rx.mergeStatic(obs, animationFactory(a.analyser)(stage)))
        ),
        analyser: a.analyser
      })
  }

  export namespace Animation3D {
    export interface Environment {
      readonly scene: THREE.Scene
      readonly camera: THREE.PerspectiveCamera
      readonly renderer: THREE.Renderer
      readonly canvas: HTMLCanvasElement
      readonly controls: OrbitControls
    }

    export interface RenderOptions {
      readonly cameraOptions: {
        /** [fov=50] Camera frustum vertical field of view. Default value is 50. */
        readonly fov?: number
        /** [near=0.1] Camera frustum near plane. Default value is 0.1. */
        readonly near?: number
        /** [far=2000] Camera frustum far plane. Default value is 2000. */
        readonly far?: number
      }
      readonly rendererOptions?: THREE.WebGLRendererParameters
      readonly dimensions: Dimensions
    }

    /** @deprecated */
    export const toScene =
      ({ cameraOptions: { fov, near, far }, rendererOptions }: RenderOptions) =>
      (strategy: Rx.Observable<AnimationStrategy<Animation3D>>): Rx.Observable<MediaStream> =>
        strategy.pipe(
          Rx.switchMap(strategy => {
            const scene = new THREE.Scene()
            const camera = new THREE.PerspectiveCamera(
              fov,
              window.innerWidth / window.innerHeight,
              near,
              far
            )
            camera.position.z = 1
            scene.add(camera)
            const renderer = new THREE.WebGLRenderer({
              canvas: document.createElement('canvas'),
              ...rendererOptions
            })
            renderer.setSize(window.innerWidth, window.innerHeight)
            document.body.prepend(renderer.domElement)

            const controls = new OrbitControls(camera, renderer.domElement)

            const resizeObserver = Rx.fromEvent(window, 'resize').pipe(
              Rx.tap(() => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
              }),
              Rx.ignoreElements()
            )

            const stream = renderer.domElement.captureStream(60)
            pipe(
              strategy.analyser.stream,
              O.map(audioStream => {
                audioStream.getAudioTracks().forEach(track => stream.addTrack(track))
              })
            )

            return Rx.mergeStatic(
              resizeObserver,
              strategy
                .animation({
                  scene,
                  camera,
                  renderer,
                  controls,
                  canvas: renderer.domElement
                })
                .pipe(
                  Rx.tap(() => {
                    controls.update()
                    renderer.render(scene, camera)
                  }),
                  Rx.ignoreElements(),
                  Rx.startWith(stream)
                )
            )
          })
        )

    export const chain =
      (animationFactory: AnimationFactory<Animation3D>) =>
      (a: AnimationStrategy<Animation3D>): AnimationStrategy<Animation3D> => ({
        animation: pipe(
          a.animation,
          R.chain(obs => stage => Rx.mergeStatic(obs, animationFactory(a.analyser)(stage)))
        ),
        analyser: a.analyser
      })
  }
}
