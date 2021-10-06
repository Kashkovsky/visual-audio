import Rx from "../rx";
import { AnimationStrategy } from "./interfaces";

export const spectrumStrategy: AnimationStrategy.MutationFactory = analyser => ctx =>
	analyser.frequency.pipe(
		Rx.tap(d => {
			const bufferLength = analyser.frequencyBinCount
			const WIDTH = document.body.clientWidth
			const HEIGHT = document.body.clientHeight
			ctx.clearRect(0, 0, WIDTH, HEIGHT)
			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.fillRect(0, 0, WIDTH, HEIGHT);
			const barWidth = (WIDTH / bufferLength) * 2.5;
			let barHeight;
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				barHeight = d[i] * 2;
				ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
				ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
				x += barWidth + 1;
			}
		})
	)

export const sineStrategy: AnimationStrategy.MutationFactory = analyser => ctx =>
	analyser.timeDomain.pipe(
		Rx.tap(data => {
			const bufferLength = analyser.frequencyBinCount
			const WIDTH = document.body.clientWidth
			ctx.fillStyle = 'rgb(200, 200, 200)';
			ctx.fillRect(0, 0, WIDTH, 100);
			ctx.lineWidth = 2;
			ctx.strokeStyle = 'rgb(0, 0, 0)';

			ctx.beginPath();

			var sliceWidth = WIDTH * 1.0 / bufferLength;
			var x = 0;

			for (var i = 0; i < bufferLength; i++) {

				var v = data[i] / 128.0;
				var y = v * 100 / 2;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			ctx.lineTo(WIDTH, 100 / 2);
			ctx.stroke();
		})
	)