import { pipe } from 'fp-ts/es6/function'
import * as TE from 'fp-ts/es6/TaskEither'
import { Dimensions } from 'geometry/rect'
import * as THREE from 'three'

export namespace UserMediaUtils {
  export const getUserMedia = (
    constraints: MediaStreamConstraints
  ): TE.TaskEither<Error, MediaStream> =>
    TE.tryCatch(
      () => navigator.mediaDevices.getUserMedia(constraints),
      (e: Error) => new Error(e.message)
    )

  export const getCameraStream: TE.TaskEither<Error, MediaStream> = getUserMedia({ video: true })

  export const cameraToTexture = (
    dimensions: Dimensions
  ): TE.TaskEither<Error, THREE.VideoTexture> =>
    pipe(
      UserMediaUtils.getCameraStream,
      TE.map(stream => {
        const video = document.createElement('video')
        Object.assign(video, {
          srcObject: stream,
          height: dimensions.height,
          width: dimensions.width,
          autoplay: true
        })
        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.generateMipmaps = false
        videoTexture.minFilter = THREE.NearestFilter
        videoTexture.magFilter = THREE.NearestFilter
        videoTexture.format = THREE.RGBFormat
        return videoTexture
      })
    )
}
