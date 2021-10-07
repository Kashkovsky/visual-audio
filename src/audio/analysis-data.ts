import * as A from 'fp-ts/es6/Array'
import { flow, pipe } from 'fp-ts/es6/function'
import { NonEmptyArray } from 'fp-ts/es6/NonEmptyArray'
import { Reader } from 'fp-ts/es6/Reader'
import { Opaque } from '~utils'
export type AnalysisData = AnalysisData.Frequency | AnalysisData.TimeDomain

export namespace AnalysisData {
  export type TimeDomain = Opaque<'TimeDomain', Uint8Array>
  export namespace TimeDomain {
    export const create = (size: number): TimeDomain => new Uint8Array(size) as TimeDomain
  }

  export type Frequency = Opaque<'Frequency', Uint8Array>
  export namespace Frequency {
    export const create = (size: number): Frequency => new Uint8Array(size) as Frequency
    export enum Fraction {
      subBass,
      bass,
      lowMiddle,
      highMiddle,
      high,
      air
    }

    export type Fractions = ReadonlyArray<NonEmptyArray<number>>

    export const toFractions = (data: AnalysisData.Frequency): Fractions =>
      pipe([...data], A.chunksOf(Math.floor(data.length / Object.keys(Fraction).length)))

    export const filter = (...fractions: Fraction[]): Reader<AnalysisData.Frequency, number[]> =>
      flow(toFractions, frequencies =>
        pipe(
          fractions,
          A.map(fraction => frequencies[fraction]),
          A.flatten
        )
      )
  }
}
