import { Rect } from "./rect";

export interface Circle {
	readonly center: Rect.Point
	readonly radius: number
}

export namespace Circle {
	export const empty: Circle = {
		center: Rect.Point.empty,
		radius: 0
	}

	export const getPoint = (circle: Circle, distanceFromCenter = circle.radius) => (angle: number): Rect.Point => ({
		x: circle.center.x + distanceFromCenter * Math.cos(angle),
		y: circle.center.y + distanceFromCenter * Math.sin(angle)
	})

	/**
	 * Converts abstract unit to angle
	 * @param unit - duration or velocity
	 * @returns angle from 0 to 360
	 */
	export const unitToAngle = (unit: number): number => unit % 360

	/**
	 * @returns whether @param point is within the @param circle
	 */
	export const hasPoint = (circle: Circle) => (point: Rect.Point): boolean => Rect.Point.distance(circle.center)(point) <= circle.radius
}