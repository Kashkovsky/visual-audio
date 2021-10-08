import { Sound } from '../audio'
import * as R from 'fp-ts/es6/Reader'
import { pipe } from 'fp-ts/es6/function'
import Rx from '../rx'
import Konva from 'konva'

export interface AnimationStrategy {
  readonly animation: AnimationStrategy.Animation
  readonly analyser: Sound.AnalysedNode
}

export namespace AnimationStrategy {
  export type Animation = R.Reader<Konva.Stage, Rx.Observable<void>>
  export type AnimationFactory = R.Reader<Sound.AnalysedNode, Animation>
  export const create =
    (animationFactory: AnimationFactory) =>
    (analyser: Sound.AnalysedNode): AnimationStrategy => ({
      animation: animationFactory(analyser),
      analyser
    })

  export const render =
    () =>
    (strategy: AnimationStrategy): Rx.Observable<void> => {
      const stage = new Konva.Stage({
        container: 'root',
        width: window.innerWidth,
        height: window.innerHeight
      })
      return strategy.animation(stage)
    }

  export const chainAnimation =
    (animationFactory: AnimationFactory) =>
    (a: AnimationStrategy): AnimationStrategy => ({
      animation: pipe(
        a.animation,
        R.chain(obs => stage => Rx.mergeStatic(obs, animationFactory(a.analyser)(stage)))
      ),
      analyser: a.analyser
    })
}
