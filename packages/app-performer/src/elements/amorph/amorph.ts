import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { AnimatedElement } from '../../elements'
import { ObjectUtils, Rx } from '@va/engine'
import { flow } from 'fp-ts/es6/function'

export namespace Amorph {
  export interface Config {
    /** @default 5 */
    readonly sensitivity?: number
    /** @default 1 */
    readonly rotationFactor?: number
    /** @default 0.02 */
    readonly strength?: number
    /** @default 0.5 */
    readonly frequency?: number
    /** @default 0 */
    readonly distance?: number
    /** @default false */
    readonly colored?: boolean
  }

  const defaultConfig: Required<Config> = {
    sensitivity: 5,
    rotationFactor: 1,
    strength: 0.02,
    frequency: 0.5,
    distance: 0,
    colored: false
  }

  export const create: AnimatedElement.Factory<Config> = flow(
    ObjectUtils.withDefault(defaultConfig),
    config =>
      ({ camera, scene, gui }) => {
        gui.addAll(config)
        const camFactor = camera.position.z * 0.25
        const geometry = new THREE.SphereBufferGeometry(camFactor, 128, 128)
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            vTime: { value: 0 },
            vDistortionFrequency: { value: config.sensitivity },
            vDisplacementFrequency: { value: 3 },
            vDisplacementStrength: { value: 0.2 },
            colored: { value: config.colored }
          }
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.z = config.distance
        scene.add(mesh)

        const update = (velocity: number) => {
          mesh.material.uniforms.vTime.value += velocity * 0.5
          mesh.material.uniforms.vDisplacementFrequency.value = velocity * config.frequency
          mesh.material.uniforms.vDisplacementStrength.value = 0.2 + velocity * config.strength
          mesh.rotation.x += 0.005 * velocity * config.rotationFactor
          mesh.rotation.y += 0.005 * velocity * config.rotationFactor
        }

        return Rx.of({
          elements: [mesh],
          update
        })
      }
  )
}
