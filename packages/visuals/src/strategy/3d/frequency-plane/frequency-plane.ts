import { RxAnimation, AnimationStrategy } from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as THREE from 'three'
import * as fragment from './shaders/fragment.glsl'
import * as vertex from './shaders/vertex.glsl'

export const frequencyPlaneStrategy =
  (): AnimationStrategy.AnimationFactory<AnimationStrategy.Animation3D> => audio => env => {
    const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 64, 64)
    const imageSize = 512
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        particleSize: { value: 6 },
        imageSize: { value: imageSize },
        frequency: { value: new Array(256) },
        time: { value: 0 }
      },
      transparent: false,
      depthTest: false,
      depthWrite: false
    })

    const mesh = new THREE.Points(planeGeometry, material)
    mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -45)
    const meshReversed = mesh.clone()
    meshReversed.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
    meshReversed.translateX(-0.5)
    mesh.translateX(0.5)
    env.camera.position.z = 1
    env.scene.add(mesh, meshReversed)

    return pipe(
      audio.frequency,
      RxAnimation.draw(data => {
        material.uniforms.time.value += 1
        material.uniforms.frequency.value = data
      })
    )
  }
