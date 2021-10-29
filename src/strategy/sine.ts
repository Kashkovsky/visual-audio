import { pipe } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
import { RxAnimation } from '../animation'
import { AnimationStrategy } from './interfaces'

type SineStrategyConfig = Konva.LineConfig

export const sineStrategy: Reader<
  SineStrategyConfig,
  AnimationStrategy.AnimationFactory<AnimationStrategy.Animation2D>
> = config => audio => stage => {
  const layer = new Konva.Layer()
  stage.add(layer)

  return pipe(
    audio.waveform,
    RxAnimation.draw(data => {
      layer.destroyChildren()
      const bufferLength = audio.analyser.fftSize
      const width = stage.width()
      const sliceWidth = (width * 1.0) / bufferLength

      let x = 0
      const points = []
      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 128.0
        const y = (v * 100) / 2
        points.push(x, y)
        x += sliceWidth
      }

      const line = new Konva.Line({
        stroke: 'red',
        strokeWidth: 5,
        ...config,
        points
      })

      layer.add(line)
    })
  )
}
