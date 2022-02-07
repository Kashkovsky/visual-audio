import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { AnimatedElement } from '../../elements'
import model from './assets/head.glb'
import texture from './assets/vibrant-texture.png'
import { ObjectUtils, ResourceLoader, Rx } from '@va/engine'
import { flow } from 'fp-ts/es6/function'

export namespace VibrantOx {
  export interface Config {
    /** @default 5 */
    readonly sensitivity?: number
    /** @default 0.02 */
    readonly strength?: number
    /** @default 0.5 */
    readonly frequency?: number
    /** @default false */
    readonly colored?: boolean
  }

  const defaultConfig: Required<Config> = {
    sensitivity: 0.1,
    strength: 0.02,
    frequency: 0.2,
    colored: true
  }
  export const create: AnimatedElement.Factory<Config> = flow(
    ObjectUtils.withDefault(defaultConfig),
    config =>
      ({ scene, camera, gui }) =>
        Rx.combineLatestStatic([
          ResourceLoader.gltf(model).value,
          ResourceLoader.texture(texture).value
        ]).pipe(
          Rx.map(([gltf, texture]) => {
            gui.addAll(config)
            camera.position.set(-0.671217770449536, -0.7254989367485515, 1.7387115912104119)
            const material = new THREE.ShaderMaterial({
              vertexShader,
              fragmentShader,
              uniforms: {
                vTime: { value: 0 },
                vDistortionFrequency: { value: config.sensitivity },
                vDisplacementFrequency: { value: config.frequency },
                vDisplacementStrength: { value: config.strength },
                cameraPosition: { value: camera.position },
                colored: { value: config.colored },
                vTexture: { value: texture }
              },
              dithering: true
            })

            scene.add(new THREE.AmbientLight())
            scene.add(gltf.scene)

            gltf.scene.traverse((x: THREE.Mesh) => {
              if ((<THREE.Mesh>x).isMesh) {
                x.geometry.center()
                x.geometry.merge
                x.scale.set(5, 5, 5)
                x.material = material
              }
            })

            const update = (velocity: number) => {
              material.uniforms.colored.value = config.colored
              material.uniforms.vDistortionFrequency.value = config.sensitivity
              material.uniforms.vDisplacementFrequency.value = velocity * config.frequency
              material.uniforms.vDisplacementStrength.value = 0.2 + velocity * config.strength

              material.uniforms.vTime.value += 1
              material.uniforms.cameraPosition.value = camera.position
              gltf.scene.rotation.x = velocity * 0.01
            }

            return {
              elements: gltf.scene.children,
              update
            }
          })
        )
  )
}
