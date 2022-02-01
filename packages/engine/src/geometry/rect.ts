export interface Rect {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

export namespace Rect {
  export const empty: Rect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }

  export interface Point {
    x: number
    y: number
  }

  export namespace Point {
    export const empty: Point = {
      x: 0,
      y: 0
    }

    /** Calculates distance between points a & b */
    export const distance =
      (a: Point) =>
      (b: Point): number =>
        Math.sqrt(Math.abs(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)))
  }
}

export interface Dimensions {
  readonly width: number
  readonly height: number
}

export namespace Dimensions {
  export const empty: Dimensions = { width: 0, height: 0 }
}
