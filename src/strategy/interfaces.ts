import { Sound } from '../audio'
import * as R from 'fp-ts/es6/Reader'
import { pipe } from 'fp-ts/es6/function'
import Rx from '../rx'
import Konva from 'konva'

export interface AnimationStrategy {
  readonly mutation: AnimationStrategy.Mutation
  readonly analyser: Sound.AnalysedNode
}

export namespace AnimationStrategy {
  export type Mutation = R.Reader<Konva.Stage, Rx.Observable<void>>
  export type MutationFactory = R.Reader<Sound.AnalysedNode, Mutation>
  export const create =
    (mutation: MutationFactory) =>
    (analyser: Sound.AnalysedNode): AnimationStrategy => ({
      mutation: mutation(analyser),
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
      return strategy.mutation(stage)
    }

  export const chainMutation =
    (mutation: MutationFactory) =>
    (a: AnimationStrategy): AnimationStrategy => ({
      mutation: pipe(
        a.mutation,
        R.chain(obs => stage => Rx.mergeStatic(obs, mutation(a.analyser)(stage)))
      ),
      analyser: a.analyser
    })
}
