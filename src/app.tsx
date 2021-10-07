import { Sound } from './audio'
import { flow } from 'fp-ts/es6/function'
import { AnimationStrategy, sineStrategy, spectrumStrategy, pulseStrategy } from './strategy'

const analyserConfig = { minDecibels: -90, maxDecibels: -10, fftSize: 256 }

export const App = () =>
  Sound.createFor(
    flow(
      Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
      Sound.AnalysedNode.attachAnimation(
        flow(
          AnimationStrategy.create(spectrumStrategy({})),
          AnimationStrategy.chainMutation(sineStrategy({ stroke: 'white' })),
          AnimationStrategy.chainMutation(pulseStrategy({ radiusFactor: 2, stroke: 'white' })),
          AnimationStrategy.render()
        )
      )
    )
  ).subscribe()
