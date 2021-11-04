import * as THREE from 'three'
import { easeOutBounce, RxAnimation } from '../../../animation'
import { AnimationStrategy } from '../../interfaces'
import { pipe } from 'fp-ts/es6/function'
import { AnalysisData } from '../../../audio'
import Rx from '../../../rx'
import * as vertexShader from './shaders/vertex.glsl'
import * as fragmentShader from './shaders/fragment.glsl'

export const playgroundStrategy =
  (): AnimationStrategy.AnimationFactory<AnimationStrategy.Animation3D> =>
  audio =>
  ({ scene, camera }) => {
    camera.position.z = 210
    const geometry = new THREE.SphereBufferGeometry(100, 128, 128)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader
    })
    const mesh = new THREE.Mesh(geometry, material)

    const light = new THREE.PointLight(0xffffff, 10)
    light.position.set(2, 3, 1000)

    scene.add(mesh, light)

    return pipe(
      audio.frequency,
      Rx.map(AnalysisData.Frequency.pick(AnalysisData.Frequency.Fraction.subBass)),
      Rx.map(AnalysisData.compress(50)),
      RxAnimation.reverb({ duration: 500, easing: easeOutBounce }),
      Rx.map(AnalysisData.mean),
      RxAnimation.draw(() => {
        mesh.rotation.x += 0.01
        mesh.rotation.y += 0.01 //(0.01 * vel) / 2
      })
    )
  }
