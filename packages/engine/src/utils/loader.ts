import { Rx } from '../rx'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { Reader } from 'fp-ts/es6/Reader'
import { identity } from 'fp-ts/es6/function'

export namespace ResourceLoader {
  export interface Resource<T> {
    readonly progress: Rx.Observable<{
      loaded: number
      total: number
    }>

    value: Rx.Observable<T>
  }

  export namespace Resource {
    export interface Progress {
      readonly loaded: number
      readonly total: number
    }
  }

  interface Loader<T> extends THREE.Loader {
    load(
      url: string,
      onLoad: (x: T) => void,
      onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined,
      onError?: ((event: ErrorEvent) => void) | undefined
    ): void
  }

  /**
   * Loads GLTF/GLB 3d models
   * @returns {Resource<GLTF>} GLTF resource
   */
  export const gltf: Reader<string, Resource<GLTF>> = load(new GLTFLoader())

  /**
   * Loads images
   * @returns {Resource<THREE.Texture>} image texture resource
   */
  export const texture: Reader<string, Resource<THREE.Texture>> = load(
    new THREE.ImageBitmapLoader(),
    image => new THREE.CanvasTexture(image)
  )

  function load<T, R = T>(loader: Loader<T>, map: Reader<T, R> = identity as Reader<T, R>) {
    return (url: string): Resource<R> => {
      const value = new Rx.Subject<R>()
      const progress = new Rx.Subject<Resource.Progress>()
      loader.load(
        url,
        (x: T) => value.next(map(x)),
        (p: ProgressEvent) => progress.next(p),
        (e: ErrorEvent) => value.error(e)
      )
      return { value, progress }
    }
  }
}
