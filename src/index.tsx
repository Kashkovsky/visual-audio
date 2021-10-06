  
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './app'


ReactDOM.render(
    <App/>,
    document.getElementById('root')
  )
  
if (module.hot) {
    module.hot.accept('./app', () => {
      const { App } = require('./app')
      ReactDOM.unmountComponentAtNode(document.getElementById('root')!)
      ReactDOM.render(<App />, document.getElementById('root'))
    })
}
  
{/* <audio id="audioElement" src="audio/Odesza - Above The Middle.mp3"></audio>
<canvas id="wave"></canvas>
<div>
  <button onclick="document.getElementById('audioElement').play()">Play the Audio</button>
  <button onclick="document.getElementById('audioElement').pause()">Pause the Audio</button>
  <button onclick="document.getElementById('audioElement').volume+=0.1">Increase Volume</button>
  <button onclick="document.getElementById('audioElement').volume-=0.1">Decrease Volume</button>
</div> */}
//Without var to make it a global variable accessable by the html onclick attribute 
// audioElement = document.getElementById('audioElement');
// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// var audioSrc = audioCtx.createMediaElementSource(audioElement);
// var analyser = audioCtx.createAnalyser();

// // Bind our analyser to the media element source.
// audioSrc.connect(analyser);
// audioSrc.connect(audioCtx.destination);

// //Get frequency data (400 = max frequency)
// var frequencyData = new Uint8Array(400);
// //Use below to show all frequencies
// //var frequencyData = new Uint8Array(analyser.frequencyBinCount);

// //Create canvas
// var canvas = document.getElementById("wave");
// canvas.style.width = "500px";
// canvas.style.height = "100px";

// //High dpi stuff
// canvas.width = parseInt(canvas.style.width) * 2;
// canvas.height = parseInt(canvas.style.height) * 2;

// //Get canvas context
// var ctx = canvas.getContext("2d");

// //Set stroke color
// ctx.strokeStyle = "#ffff00"

// //Draw twice as thick lines due to high dpi scaling
// ctx.lineWidth = 2;

// //Animation reference
// var animation;

// //On play
// audioElement.onplay = funtion() {
//     drawWave();
// };

// //On pause
// audioElement.onpause = funtion() {
//     cancelAnimationFrame(animation);
// };

// //On ended
// audioElement.onended = funtion() {
//     cancelAnimationFrame(animation);
// };

// //Our drawing method
// function drawWave() {
//     // Copy frequency data to frequencyData array.
//     analyser.getByteFrequencyData(frequencyData);

//     //Draw the wave
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     for(var i = 1; i < frequencyData.length; i++) {
//         var x1 = canvas.width / (frequencyData.length - 1) * (i - 1);
//         var x2 = canvas.width / (frequencyData.length - 1) * i;
//         var y1 = canvas.height - frequencyData[i - 1] / 255 * canvas.height;
//         var y2 = canvas.height - frequencyData[i] / 255 * canvas.height;
//         if(x1 && y1 && x2 && y2) {
//             ctx.beginPath();
//             ctx.moveTo(x1, y1);
//             ctx.lineTo(x2, y2);
//             ctx.stroke();
//         }
//     }

//     //Animate
//     animation = requestAnimationFrame(drawWave);
// }