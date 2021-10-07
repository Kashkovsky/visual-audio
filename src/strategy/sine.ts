import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
import Rx from '../rx'
import { AnimationStrategy } from './interfaces'

type SineStrategyConfig = Konva.LineConfig

export const sineStrategy: Reader<SineStrategyConfig, AnimationStrategy.MutationFactory> =
  config => audio => stage => {
    audio.analyser.fftSize = 256
    const layer = new Konva.Layer()
    stage.add(layer)

    return audio.timeDomain.pipe(
      Rx.tap(data => {
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
