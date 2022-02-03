import { Sound } from '../audio'
import { flow } from 'fp-ts/es6/function'
import { Reader } from 'fp-ts/es6/Reader'
import { Rx } from '../rx'
import { createCanvas } from '../utils'
import { VAWorker } from './va-worker'
import * as StatsUI from 'stats.js'

/** Multi-process animation */
export interface MultiProcessAnimation
  extends Reader<Rx.Observable<Sound.AnalysedNode<AudioNode>>, Rx.Observable<VAWorker>> {}

export namespace MultiProcessAnimation {
  export interface AnimationDescriptor {
    readonly name: string
    readonly config?: unknown
  }

  export interface Config extends Omit<VAWorker.Config, 'canvas'> {
    readonly stats?: Config.Stats
  }

  export namespace Config {
    export enum Stats {
      fps,
      msPerFrame,
      memory
    }
  }

  const createWorkerConfig =
    (config: Config) =>
    (canvas: HTMLCanvasElement): VAWorker.Config => ({
      ...config,
      canvas
    })
  export const create = (config: Config): MultiProcessAnimation =>
    flow(
      Rx.switchMap(node => {
        initStats(config.stats)
        const worker = flow(createCanvas, createWorkerConfig(config), VAWorker.create)()
        const resizeObserver = Rx.fromEvent(window, 'resize').pipe(
          Rx.tap(() => worker.resize()),
          Rx.ignoreElements()
        )

        const frequency = node.frequency.pipe(Rx.tap(worker.frequency), Rx.ignoreElements())
        const waveform = node.waveform.pipe(Rx.tap(worker.waveform), Rx.ignoreElements())

        return Rx.mergeStatic(resizeObserver, frequency, waveform, Rx.of(worker))
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
