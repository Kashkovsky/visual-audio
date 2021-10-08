import { pipe } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
import { RxAnimation } from '../animation'
import { AnimationStrategy } from './interfaces'

export interface SpectrumStrategyConfig {
  background?: Konva.RectConfig
  bar?: Konva.RectConfig
}
export const spectrumStrategy: Reader<SpectrumStrategyConfig, AnimationStrategy.AnimationFactory> =
  config => audio => stage => {
    const layer = new Konva.Layer()
    stage.add(layer)

    return pipe(
      audio.frequency,
      RxAnimation.draw(d => {
        layer.destroyChildren()
        const bufferLength = audio.analyser.frequencyBinCount
        const width = (config.background && config.background.width) || stage.width()
        const height = (config.background && config.background.height) || stage.height()

        const background = new Konva.Rect({
          width,
          height,
          fill: 'black',
          x: 0,
          y: 0,
          ...config.background
        })

        layer.add(background)

        const barWidth = (width / bufferLength) * 2.5
        let barHeight
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
          barHeight = d[i] * 2
          const bar = new Konva.Rect({
            fill: `rgb(${barHeight + 100},50,50)`,
            ...config.bar,
            x,
            y: height - barHeight,
            width: barWidth,
            height: barHeight
          })

          layer.add(bar)
          x += barWidth + 1
        }
      })
    )
  }
