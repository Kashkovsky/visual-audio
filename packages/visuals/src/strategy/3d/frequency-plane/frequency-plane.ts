import { RxAnimation, AnimationStrategy } from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as THREE from 'three'
import * as fragment from './shaders/fragment.glsl'
import * as vertex from './shaders/vertex.glsl'

export interface FrequencyPlaneConfig {
  /**
   * Amount of noise applied from 0 to 1
   * @default 0
   */
  readonly noiseStrength?: number
  /** @default A */
  readonly noiseType?: FrequencyPlaneConfig.NoiseType
  /** @default false */
  readonly colored?: boolean
  readonly background?: THREE.Color | THREE.Texture
}

export namespace FrequencyPlaneConfig {
  export enum NoiseType {
    A,
    B,
    C,
    D,
    E,
    G
  }
}

export const frequencyPlaneStrategy =
  ({
    noiseStrength = 0,
    noiseType = FrequencyPlaneConfig.NoiseType.A,
    colored = false,
    background
  }: FrequencyPlaneConfig): AnimationStrategy.BackgroundAnimationFactory<AnimationStrategy.Animation3D> =>
  audio =>
  env => {
    const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 64, 64)
    const imageSize = 512
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        particleSize: { value: 3 },
        imageSize: { value: imageSize },
        frequency: { value: new Array(256) },
        time: { value: 0 },
        noiseStrength: { value: noiseStrength },
        noiseType: { value: noiseType },
        colored: { value: colored }
      },
      transparent: false,
      depthTest: false,
      depthWrite: false
    })

    if (background) {
      env.scene.background = background
    }
    const mesh = new THREE.Points(planeGeometry, material)
    mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -45)
    const meshReversed = mesh.clone()
    meshReversed.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
    meshReversed.translateX(-0.5)
    mesh.translateX(0.5)
    env.camera.position.z = 1
    env.scene.add(mesh, meshReversed)
    env.controls.enableRotate = true
    return pipe(
      audio.frequency,
      RxAnimation.draw(data => {
        material.uniforms.time.value += 1
        material.uniforms.frequency.value = data
      })
    )
  }
