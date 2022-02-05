import { AnimationStrategy, Rx } from '@va/engine'
import { Reader } from 'fp-ts/es6/Reader'
import * as THREE from 'three'

export interface AnimatedElementInstance {
  readonly elements: ReadonlyArray<THREE.Object3D<THREE.Event>>
  readonly update: (...args: number[]) => void
}

export type AnimatedElement = Reader<
  AnimationStrategy.Animation3D.Environment,
  Rx.Observable<AnimatedElementInstance>
>

export namespace AnimatedElement {
  export type Factory<TConfig> = Reader<TConfig, AnimatedElement>
}
