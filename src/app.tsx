// import { F } from '@grammarly/focal'
import * as React from 'react'
import { Sound } from './audio'
import { flow } from 'fp-ts/es6/function'
import { Drawer } from './draw'
import { AnimationStrategy, sineStrategy, spectrumStrategy } from './strategy'

const analyserConfig = { minDecibels: -90, maxDecibels: -10, fftSize: 256 }
export const App = () => {
	const onCanvasReady = (canvasContext: CanvasRenderingContext2D) =>
		Sound.createFor(
			flow(
				Sound.AnalysedNode.fromUserMediaToOut(analyserConfig),
				Sound.AnalysedNode.attachAnimation(flow(
					AnimationStrategy.create(spectrumStrategy),
					AnimationStrategy.chainMutation(sineStrategy),
					AnimationStrategy.render(canvasContext)
				))
			)
		)
	
	return <Drawer onContextReady={onCanvasReady}/>
}