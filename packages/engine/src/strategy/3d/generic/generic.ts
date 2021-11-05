import { RxAnimation } from '../../../animation'
import { AnimationStrategy } from '../../interfaces'
import { pipe } from 'fp-ts/es6/function'
import { AnalysisData } from '../../../audio'
import Rx from '../../../rx'
import { AnimatedElement } from '../../../elements'

export interface GenericStrategyConfig {
  readonly element: AnimatedElement
  readonly background?: THREE.Color | THREE.Texture
}

export const genericStrategy =
  (
    config: GenericStrategyConfig
  ): AnimationStrategy.AnimationFactory<AnimationStrategy.Animation3D> =>
  audio =>
  env => {
    if (config.background) {
      env.scene.background = config.background
    }
    env.camera.position.z = 2
    const element = config.element(env)

    return pipe(
      audio.frequency,
      Rx.map(AnalysisData.sum),
      Rx.map(x => x / 200),
      RxAnimation.draw(element.update)
    )
  }
