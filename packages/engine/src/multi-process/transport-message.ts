import { AnimationStrategy } from '../animation'
import { AnalysisData } from '../audio'
import { Rect } from '../geometry'

export namespace TransportMessage {
  export type UI<TCOnfig = unknown> =
    | UI.Init
    | UI.Frequency
    | UI.Waveform
    | UI.Size
    | UI.Start<TCOnfig>
    | UI.Event
    | UI.UpdateProperty

  export namespace UI {
    export interface Init {
      readonly kind: 'init'
      readonly proxyId: number
      readonly options: AnimationStrategy.Animation3D.RenderOptions
      readonly canvas: THREE.OffscreenCanvas
    }

    export namespace Init {
      export const create = (
        options: AnimationStrategy.Animation3D.RenderOptions,
        canvas: THREE.OffscreenCanvas,
        proxyId: number
      ): UI.Init => ({
        kind: 'init',
        options,
        canvas,
        proxyId
      })
    }
    export interface Frequency {
      readonly kind: 'frequency'
      readonly data: AnalysisData.Frequency
    }

    export namespace Frequency {
      export const create = (data: AnalysisData.Frequency): UI.Frequency => ({
        kind: 'frequency',
        data
      })
    }

    export interface Waveform {
      readonly kind: 'waveform'
      readonly data: AnalysisData.Waveform
    }

    export namespace Waveform {
      export const create = (data: AnalysisData.Waveform): UI.Waveform => ({
        kind: 'waveform',
        data
      })
    }

    export interface Size {
      readonly kind: 'size'
      readonly rect: Rect
    }

    export namespace Size {
      export const create = (rect: Rect): UI.Size => ({
        kind: 'size',
        rect
      })

      export const fromWindowSize = (): UI.Size => ({
        kind: 'size',
        rect: {
          width: window.innerWidth,
          height: window.innerHeight,
          top: 0,
          bottom: window.innerHeight,
          left: 0,
          right: window.innerWidth
        }
      })
    }

    export interface Start<TCOnfig = unknown> {
      readonly kind: 'start'
      readonly strategy: string
      readonly config?: TCOnfig
    }

    export namespace Start {
      export const create = <TConfig = unknown>(
        strategy: string,
        config?: TConfig
      ): UI.Start<TConfig> => ({
        kind: 'start',
        strategy,
        config
      })
    }

    export interface Event {
      readonly kind: 'event'
      readonly id: number
      readonly data: any
    }

    export namespace Event {
      export const create = (id: number, data: any): UI.Event => ({
        kind: 'event',
        id,
        data
      })
    }

    export interface UpdateProperty {
      readonly kind: 'update-property'
      readonly property: string
      readonly value: any
    }

    export namespace UpdateProperty {
      export const create = (property: string, value: any): UI.UpdateProperty => ({
        kind: 'update-property',
        property,
        value
      })
    }
  }

  export type Worker = Worker.CreateGUI

  export namespace Worker {
    export interface CreateGUI {
      readonly kind: 'create-gui'
      readonly property: string
      readonly initialValue: any
      readonly label?: string
      readonly min?: number
      readonly max?: number
    }

    export namespace CreateGUI {
      export const is = (msg: Worker): msg is Worker.CreateGUI => msg.kind === 'create-gui'
      export const create = (
        property: string,
        initialValue: any,
        label?: string,
        min?: number,
        max?: number
      ): Worker.CreateGUI => ({
        kind: 'create-gui',
        initialValue,
        property,
        label,
        min,
        max
      })
    }
  }
}
