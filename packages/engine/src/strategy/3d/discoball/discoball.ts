import * as THREE from 'three'
import { easeOutBounce, RxAnimation } from '../../../animation'
import { AnimationStrategy } from '../../interfaces'
import { pipe } from 'fp-ts/es6/function'
import { AnalysisData } from '../../../audio'
import Rx from '../../../rx'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import mapUrl from 'url:./discoball-map.png'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import bgUrl from 'url:./nebula-bg.png'
/** Add debug GUI for given props */
// import { GUI } from 'dat.gui'
// const gui = new GUI()
// gui.add(light3.position, 'x').min(-3).max(3).step(0.1)
// gui.add(light3.position, 'y').min(-3).max(3).step(0.1)
// gui.add(light3.position, 'z').min(-3).max(3).step(0.1)
export const discoballStrategy =
  (): AnimationStrategy.AnimationFactory<AnimationStrategy.Animation3D> =>
  audio =>
  ({ scene }) => {
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(mapUrl)
    const bg = textureLoader.load(bgUrl)
    scene.background = bg
    const geometry = new THREE.SphereBufferGeometry(100, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      metalness: 0.5,
      roughness: 0.1,
      color: new THREE.Color(0x000000),
      normalMap: texture,
      envMap: bg
    })
    const mesh = new THREE.Mesh(geometry, material)

    const light = new THREE.PointLight(0xffffff, 10)
    light.position.set(2, 3, 1000)

    const light2 = new THREE.PointLight(0xff0000, 2)
    light2.position.set(-3, 3, 100)

    const light3 = new THREE.PointLight(0x0000ff, 2)
    light3.position.set(2.9, -3, 0)

    scene.add(mesh, light, light2, light3)

    return pipe(
      audio.frequency,
      Rx.map(AnalysisData.Frequency.pick(AnalysisData.Frequency.Fraction.subBass)),
      Rx.map(AnalysisData.compress(50)),
      RxAnimation.reverb({ duration: 500, easing: easeOutBounce }),
      Rx.map(AnalysisData.mean),
      RxAnimation.draw(vel => {
        mesh.rotation.x += 0.01
        mesh.rotation.y += (0.01 * vel) / 2
        light2.intensity = light3.intensity = vel * 100
      })
    )
  }
