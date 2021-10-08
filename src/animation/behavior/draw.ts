import { flow } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import { AnalysisData } from '../../audio'
import Rx from '../../rx'

export const draw = (f: Reader<AnalysisData, void>): Rx.OperatorFunction<AnalysisData, void> =>
  flow(Rx.tap(f), Rx.mapTo<void>(void 0))
