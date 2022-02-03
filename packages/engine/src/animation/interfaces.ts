import { AnalysisData } from '../audio'
import * as R from 'fp-ts/es6/Reader'
import { pipe } from 'fp-ts/es6/function'
import { Rx } from '../rx'
import * as THREE from 'three'
import { Dimensions } from '../geometry'
export interface AnimationStrategy {
  readonly animation: AnimationStrategy.Animation
  readonly data: AnalysisData.Combined
}

export interface BackgroundAnimationStrategy<Animation extends AnimationStrategy.Animation> {
  readonly animation: Animation
  readonly data: AnalysisData.Combined
}

export namespace AnimationStrategy {
  export type Animation3D = R.Reader<Animation3D.Environment, Rx.Observable<void>>
  export type Animation = Animation3D
  export type AnimationFactory = R.Reader<AnalysisData.Combined, AnimationStrategy.Animation>

  export const create =
    (animationFactory: AnimationFactory) =>
    (data: AnalysisData.Combined): AnimationStrategy => ({
      animation: animationFactory(data),
      data
    })

  export const createBackground =
    (animationFactory: R.Reader<AnalysisData.Combined, AnimationStrategy.Animation>) =>
    (data: AnalysisData.Combined): BackgroundAnimationStrategy<Animation> => ({
      animation: animationFactory(data),
      data
    })

  export namespace Animation3D {
    export interface Environment {
      readonly scene: THREE.Scene
      readonly camera: THREE.PerspectiveCamera
      readonly renderer: THREE.Renderer
      readonly canvas: HTMLCanvasElement
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
      (strategy: Rx.Observable<AnimationStrategy>): Rx.Observable<MediaStream> =>
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

            return Rx.mergeStatic(
              resizeObserver,
              strategy
                .animation({
                  scene,
                  camera,
                  renderer,
                  canvas: renderer.domElement
                })
                .pipe(
                  Rx.tap(() => {
                    renderer.render(scene, camera)
                  }),
                  Rx.ignoreElements(),
                  Rx.startWith(stream)
                )
            )
          })
        )

    export const chain =
      (animationFactory: AnimationFactory) =>
      (a: AnimationStrategy): AnimationStrategy => ({
        animation: pipe(
          a.animation,
          R.chain(obs => stage => Rx.mergeStatic(obs, animationFactory(a.data)(stage)))
        ),
        data: a.data
      })
  }
}
