import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { AnimatedElement } from '../../elements'
import model from './assets/ox-model.glb'
import texture from './assets/vibrant-texture.png'
import { ResourceLoader, Rx } from '@va/engine'

export namespace VibrantOx {
  export interface Config {
    /** @default 5 */
    readonly distortionFrequency?: number
    /** @default 1 */
    readonly rotationFactor?: number
    /** @default 0.02 */
    readonly displasementStrength?: number
    /** @default 0.5 */
    readonly displasementFrequency?: number
    /** @default 0 */
    readonly distance?: number
    /** @default false */
    readonly colored?: boolean
  }
  export const create: AnimatedElement.Factory<Config> =
    ({
      distortionFrequency = 5,
      displasementStrength = 0.02,
      displasementFrequency = 0.2,
      colored = false
    }) =>
    ({ scene, camera }) =>
      Rx.combineLatestStatic([
        ResourceLoader.gltf(model).value,
        ResourceLoader.texture(texture).value
      ]).pipe(
        Rx.map(([gltf, texture]) => {
          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              vTime: { value: 0 },
              vDistortionFrequency: { value: distortionFrequency },
              vDisplacementFrequency: { value: displasementFrequency },
              vDisplacementStrength: { value: displasementStrength },
              cameraPosition: { value: camera.position },
              colored: { value: colored },
              vTexture: { value: texture }
            }
          })

          scene.add(gltf.scene)

          gltf.scene.traverse((x: THREE.Mesh) => {
            if ((<THREE.Mesh>x).isMesh) {
              x.geometry.center()
              x.scale.set(0.1, 0.1, 0.1)
              x.material = material
            }
          })

          const update = (velocity: number) => {
            material.uniforms.vTime.value += velocity * 0.5
            material.uniforms.vDisplacementFrequency.value = velocity * displasementFrequency
            material.uniforms.vDisplacementStrength.value = 0.2 + velocity * displasementStrength
          }

          return {
            elements: gltf.scene.children,
            update
          }
        })
      )
}
