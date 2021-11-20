import * as A from 'fp-ts/es6/Array'
import { flow, pipe } from 'fp-ts/es6/function'
import { NonEmptyArray } from 'fp-ts/es6/NonEmptyArray'
import { Reader } from 'fp-ts/es6/Reader'
import { Opaque } from '../utils'
import { mean as Mean, sum as Sum } from 'mathjs'
import { Endomorphism } from 'fp-ts/es6/Endomorphism'
import { Predicate } from 'fp-ts/es6/Predicate'

export type AnalysisData = AnalysisData.Frequency | AnalysisData.Waveform

export namespace AnalysisData {
  export const from = (data: Uint8Array): AnalysisData => data as AnalysisData
  export const of = (data: Array<number>): AnalysisData => AnalysisData.from(Uint8Array.of(...data))

  /** Current waveform (time-domain) */
  export type Waveform = Opaque<'Waveform', Uint8Array>
  export namespace Waveform {
    export const from = (data: Uint8Array): AnalysisData.Waveform => data as AnalysisData.Waveform
    export const create = (size: number): Waveform => Waveform.from(new Uint8Array(size))
    export const of = (data: Array<number>): AnalysisData.Waveform =>
      AnalysisData.Waveform.from(Uint8Array.of(...data))
  }

  /** Current frequency data */
  export type Frequency = Opaque<'Frequency', Uint8Array>
  export namespace Frequency {
    export const from = (data: Uint8Array): AnalysisData.Frequency => data as AnalysisData.Frequency
    export const create = (size: number): Frequency => Frequency.from(new Uint8Array(size))
    export const of = (data: Array<number>): AnalysisData.Frequency =>
      AnalysisData.Frequency.from(Uint8Array.of(...data))
    export enum Fraction {
      subBass,
      bass,
      lowMiddle,
      highMiddle,
      high,
      air
    }

    export type Fractions = ReadonlyArray<NonEmptyArray<number>>

    /** Separates frequency @param data to equal n subarrays, where n is @see {Fraction} values count */
    export const toFractions = (data: AnalysisData.Frequency): Frequency.Fractions =>
      pipe(
        [...data],
        A.chunksOf(Math.floor(data.length / (Object.keys(Frequency.Fraction).length / 2)))
      )

    /** Picks given @param fractions from AnalysisData.Frequency */
    export const pick = (
      ...fractions: Frequency.Fraction[]
    ): Endomorphism<AnalysisData.Frequency> =>
      flow(AnalysisData.Frequency.toFractions, frequencies =>
        pipe(
          fractions,
          A.map(fraction => frequencies[fraction]),
          A.flatten,
          AnalysisData.Frequency.of
        )
      )
  }

  /** @return Mean value */
  export const mean: Reader<AnalysisData | NonEmptyArray<number>, number> = data =>
    Mean(...data) as number

  /** @return Sum of values */
  export const sum: Reader<AnalysisData | NonEmptyArray<number>, number> = data =>
    Sum(...data) as number

  /** Modifies data values with given @param f function  */
  export const map =
    (f: Endomorphism<number>): Endomorphism<AnalysisData> =>
    data =>
      AnalysisData.from(data.map(f))

  /** @returns whether the greatest data value is greater than @param level  */
  export const isGreaterThan =
    (level: number): Predicate<AnalysisData> =>
    data =>
      Math.max(...data) > level

  /** @returns whether the greatest data value is lower than @param level  */
  export const isLessThan =
    (level: number): Predicate<AnalysisData> =>
    data =>
      Math.max(...data) < level

  /** Filters out data values below @param level replacing them with 0s */
  export const gate = (level: number): Endomorphism<AnalysisData> =>
    AnalysisData.map(x => (x < level ? 0 : x))

  /** Decreases data values above @param level to @param level value */
  export const compress = (level: number): Endomorphism<AnalysisData> =>
    AnalysisData.map(x => Math.min(x, level))
}
