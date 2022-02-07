import { Sound } from '../audio'
import { flow, pipe } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import { Rx } from '../rx'
import { canvasToOffscreen, createCanvas } from '../utils'
import { VAWorkerClient } from './va-worker/va-worker-client'
import * as StatsUI from 'stats.js'
import * as O from 'fp-ts/es6/Option'
import { ElementProxy } from './orbit-controls/element-proxy'
import { AnimationStrategy } from '../animation'
import { GUIClient } from './gui/gui-client'
import type { GUI as DATGUI } from 'dat.gui'

/** Multi-process animation */
export interface MultiProcessAnimation
  extends Reader<
    Rx.Observable<Sound.AnalysedNode>,
    Rx.Observable<MultiProcessAnimation.Processor>
  > {}

export namespace MultiProcessAnimation {
  export interface Processor {
    readonly worker: VAWorkerClient
    stream: MediaStream
  }
  export interface AnimationDescriptor {
    readonly name: string
    readonly config?: unknown
  }

  export interface Config {
    readonly workerUrl: string
    readonly options: AnimationStrategy.Animation3D.RenderOptions
    readonly gui: DATGUI

    readonly stats?: Config.Stats
  }

  export namespace Config {
    export enum Stats {
      fps,
      msPerFrame,
      memory
    }
  }

  export const create = (config: Config): MultiProcessAnimation =>
    flow(
      Rx.switchMap(node => {
        initStats(config.stats)
        const worker = VAWorkerClient.createClient(config.workerUrl)
        const canvas = createCanvas()
        const proxy = ElementProxy.create(worker, canvas)
        const offscreen = canvasToOffscreen(canvas)
        const gui = GUIClient.create(config.gui, worker)

        worker.init(config.options, offscreen, proxy)

        const resizeObserver = Rx.fromEvent(window, 'resize').pipe(
          Rx.tap(() => worker.resize()),
          Rx.ignoreElements()
        )

        const frequency = node.frequency.pipe(Rx.tap(worker.frequency), Rx.ignoreElements())
        const waveform = node.waveform.pipe(Rx.tap(worker.waveform), Rx.ignoreElements())

        const stream = canvas.captureStream(60)
        pipe(
          node.stream,
          O.map(audioStream => {
            audioStream.getAudioTracks().forEach(track => stream.addTrack(track))
          })
        )

        return Rx.mergeStatic(resizeObserver, frequency, waveform, gui, Rx.of({ worker, stream }))
      })
    )

  const initStats = (opts: Config['stats']) => {
    if (opts == null) {
      return
    }

    const stats = new StatsUI()
    stats.showPanel(opts)
    document.body.appendChild(stats.dom)
    const animate = () => {
      stats.update()
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }
}
