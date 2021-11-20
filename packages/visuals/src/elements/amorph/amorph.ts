import * as THREE from 'three'
import * as vertexShader from './shaders/vertex.glsl'
import * as fragmentShader from './shaders/fragment.glsl'
import { AnimatedElement } from '../../elements'

export namespace Amorph {
  export interface Config {
    /** @default 5 */
    readonly distortionFrequency?: number
    /** @default 1 */
    readonly rotationFactor?: number
    /** @default 0.02 */
    readonly displasementStrength?: number
    /** @default 0.5 */
    readonly displasementFrequency?: number
  }
  export const create: AnimatedElement.Factory<Config> =
    ({
      distortionFrequency = 5,
      rotationFactor = 1,
      displasementStrength = 0.02,
      displasementFrequency = 0.5
    }) =>
    ({ camera, scene }) => {
      const camFactor = camera.position.z * 0.25
      const geometry = new THREE.SphereBufferGeometry(camFactor, 128, 128)
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          vTime: { value: 0 },
          vDistortionFrequency: { value: distortionFrequency },
          vDisplacementFrequency: { value: 3 },
          vDisplacementStrength: { value: 0.2 }
        }
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.z = -0.5
      scene.add(mesh)

      const update = (velocity: number) => {
        mesh.material.uniforms.vTime.value += velocity * 0.5
        mesh.material.uniforms.vDisplacementFrequency.value = velocity * displasementFrequency
        mesh.material.uniforms.vDisplacementStrength.value = 0.2 + velocity * displasementStrength
        mesh.rotation.x += 0.005 * velocity * rotationFactor
        mesh.rotation.y += 0.005 * velocity * rotationFactor
      }

      return {
        mesh,
        update
      }
    }
}
