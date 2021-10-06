import { Sound } from "../audio";
import * as R from "fp-ts/es6/Reader"
import { pipe } from "fp-ts/lib/function";
import Rx from "../rx";

export interface AnimationStrategy {
	readonly mutation: AnimationStrategy.Mutation
	readonly analyser: Sound.AnalysedNode
}

export namespace AnimationStrategy {
	export type Mutation = R.Reader<CanvasRenderingContext2D, Rx.Observable<Sound.AnalysisData>>
	export type MutationFactory = (analyser: Sound.AnalysedNode) => Mutation
	export const create = (mutation: MutationFactory) => (analyser: Sound.AnalysedNode): AnimationStrategy => ({
		mutation: mutation(analyser),
		analyser
	})

	export const render = (canvasContext: CanvasRenderingContext2D) =>
		(strategy: AnimationStrategy): Rx.Observable<Sound.AnalysisData> => strategy.mutation(canvasContext)

	export const chainMutation = (mutation: MutationFactory) => (a: AnimationStrategy) => ({
		mutation: pipe(a.mutation, R.chain(obs => ctx => Rx.mergeStatic(
			obs,
			mutation(a.analyser)(ctx),
		))),
		analyser: a.analyser
	})
}