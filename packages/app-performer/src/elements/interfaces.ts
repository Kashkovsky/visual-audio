import { AnimationStrategy } from '@va/engine'
import { Reader } from 'fp-ts/es6/Reader'
import * as THREE from 'three'

export interface AnimatedElementInstance {
  readonly mesh: THREE.Mesh
  readonly update: (...args: number[]) => void
}

export type AnimatedElement = Reader<
  AnimationStrategy.Animation3D.Environment,
  AnimatedElementInstance
>

export namespace AnimatedElement {
  export type Factory<TConfig> = Reader<TConfig, AnimatedElement>
}
