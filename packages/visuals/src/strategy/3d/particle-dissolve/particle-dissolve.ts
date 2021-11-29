import * as THREE from 'three'
import { RxAnimation, AnalysisData, Rx, AnimationStrategy } from '@va/engine'
import { flow, pipe } from 'fp-ts/es6/function'
import * as fragment from './shaders/fragment.glsl'
import * as vertex from './shaders/vertexParticles.glsl'
import * as mask from './textures/mask.png'

export interface ParticleDissolveStrategyConfig {
  readonly imageUrl?: string
  readonly tolerance?: number
  readonly imageSize?: number
  readonly particleSize?: number
  readonly initialDistortion?: number
  readonly fromCamera?: boolean
}

export namespace ParticleDissolveStrategyConfig {
  export const defaultConfig: Partial<ParticleDissolveStrategyConfig> = {
    imageSize: 512,
    particleSize: 4000,
    initialDistortion: 100,
    tolerance: 10
  }

  export const withDefault = (
    config: ParticleDissolveStrategyConfig
  ): Required<ParticleDissolveStrategyConfig> =>
    ({
      ...ParticleDissolveStrategyConfig.defaultConfig,
      ...config
    } as Required<ParticleDissolveStrategyConfig>)
}

export const particleDissolveStrategy = flow(
  ParticleDissolveStrategyConfig.withDefault,
  (config): AnimationStrategy.AnimationFactory<AnimationStrategy.Animation3D> =>
    audio =>
    ({ scene, camera }) => {
      camera.fov = 70
      camera.position.z = 1000
      camera.near = 0.1
      camera.far = 3000
      const loader = new THREE.TextureLoader()
      const maskTexture = loader.load(mask)

      const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        fragmentShader: fragment,
        vertexShader: vertex,
        uniforms: {
          particleSize: { value: config.particleSize },
          imageSize: { value: config.imageSize },
          progress: { value: 0 },
          t1: { value: null },
          mask: { value: maskTexture },
          move: { value: 0 },
          time: { value: 0 },
          mouse: { value: null }
        },
        transparent: true,
        depthTest: false,
        depthWrite: false
      })

      if (config.imageUrl) {
        material.uniforms.t1.value = loader.load(config.imageUrl)
      }

      if (config.fromCamera) {
        setVideoTexture(config, material)
      }

      const geometry = new THREE.BufferGeometry()
      const numberOfParticles = config.imageSize * config.imageSize
      const positions = new THREE.BufferAttribute(new Float32Array(numberOfParticles * 3), 3)
      const coordinates = new THREE.BufferAttribute(new Float32Array(numberOfParticles * 3), 3)
      const speeds = new THREE.BufferAttribute(new Float32Array(numberOfParticles), 1)
      const offsets = new THREE.BufferAttribute(new Float32Array(numberOfParticles), 1)

      const random = (a: number, b: number) => a + (b - a) * Math.random()

      let index = 0
      for (let i = 0; i < config.imageSize; i++) {
        for (let j = 0; j < config.imageSize; j++) {
          positions.setXYZ(index, (i - config.imageSize / 2) * 2, (j - config.imageSize / 2) * 2, 0)
          coordinates.setXYZ(index, i, j, 0)
          offsets.setX(index, random(-config.initialDistortion, config.initialDistortion))
          speeds.setX(index, random(0.4, 1))
          index++
        }
      }

      geometry.setAttribute('position', positions)
      geometry.setAttribute('aCoordinates', coordinates)
      geometry.setAttribute('aSpeed', speeds)
      geometry.setAttribute('aOffset', offsets)

      const mesh = new THREE.Points(geometry, material)
      scene.add(mesh)

      return pipe(
        audio.frequency,
        Rx.map(AnalysisData.Frequency.pick(AnalysisData.Frequency.Fraction.subBass)),
        Rx.map(AnalysisData.mean),
        RxAnimation.draw(vel => {
          material.uniforms.time.value += 1
          material.uniforms.move.value = vel / config.tolerance
        })
      )
    }
)

// TODO: move to engine
function setVideoTexture(config: ParticleDissolveStrategyConfig, material: THREE.ShaderMaterial) {
  void navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    const video = document.createElement('video')
    Object.assign(video, {
      srcObject: stream,
      height: config.imageSize,
      width: config.imageSize,
      autoplay: true
    })
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.generateMipmaps = false
    videoTexture.minFilter = THREE.NearestFilter
    videoTexture.magFilter = THREE.NearestFilter
    videoTexture.format = THREE.RGBFormat
    material.uniforms.t1.value = videoTexture
  })
}
