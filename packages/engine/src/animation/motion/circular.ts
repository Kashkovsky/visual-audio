import { FRAMES, velocity } from '../../animation'
import { Rx } from '../../rx'
import { Circle, Rect } from '../../geometry'

interface CircularMotionConfig {
  readonly circle: Circle
  readonly unitsPerSecond: number
  readonly frames?: Rx.Observable<number>
}

export function circularMotion({
  circle,
  unitsPerSecond,
  frames = FRAMES
}: CircularMotionConfig): Rx.Observable<Rect.Point> {
  const getPoint = Circle.getPoint(circle)
  return velocity(unitsPerSecond / 1000, frames).pipe(
    Rx.map(Circle.unitToAngle),
    Rx.map(getPoint),
    Rx.startWith(getPoint(0))
  )
}
