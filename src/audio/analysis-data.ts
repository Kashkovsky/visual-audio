import * as A from 'fp-ts/es6/Array'
import { flow, pipe } from 'fp-ts/es6/function'
import { NonEmptyArray } from 'fp-ts/es6/NonEmptyArray'
import { Reader } from 'fp-ts/es6/Reader'
export type AnalysisData = Uint8Array

export namespace AnalysisData {
  export namespace Frequency {
    export enum Fraction {
      subBass,
      bass,
      lowMiddle,
      highMiddle,
      high,
      air
    }

    export type Fractions = ReadonlyArray<NonEmptyArray<number>>

    export const toFractions = (data: AnalysisData): Fractions =>
      pipe([...data], A.chunksOf(Math.floor(data.length / Object.keys(Fraction).length)))

    export const filter = (...fractions: Fraction[]): Reader<AnalysisData, number[]> =>
      flow(toFractions, frequencies =>
        pipe(
          fractions,
          A.map(fraction => frequencies[fraction]),
          A.flatten
        )
      )
  }
}
