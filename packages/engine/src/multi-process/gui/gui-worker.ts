import { pipe } from 'fp-ts/es6/function'
import * as O from 'fp-ts/es6/Option'
import { ObjectUtils, StringUtils } from '../../utils'
import { TransportMessage } from '../transport-message'

export interface GUIWorker {
  add: <T extends Object>(
    object: T,
    property: keyof T,
    label?: string | undefined,
    min?: number | undefined,
    max?: number | undefined
  ) => void
  addAll: <T extends Object>(object: T) => void
  update: (property: string, value: any) => void
}
export namespace GUIWorker {
  export const create = (): GUIWorker => {
    const state = new Map<string, object>()
    const update = (property: string, value: any) => {
      pipe(
        state.get(property),
        O.fromNullable,
        O.map((obj: any) => {
          obj[property] = value
        })
      )
    }

    const add = <T extends Object>(
      object: T,
      property: keyof T,
      label?: string,
      min?: number,
      max?: number
    ) => {
      state.set(String(property), object)
      self.postMessage(
        TransportMessage.Worker.CreateGUI.create(
          String(property),
          object[property],
          label,
          min,
          max
        )
      )
    }

    const addAll = <T extends Object>(object: T) => {
      ObjectUtils.entries(object).forEach(([key, value]) => {
        const min = typeof value === 'number' ? value / 10 : undefined
        const max = typeof value === 'number' ? value * 10 : undefined
        add(object, key, StringUtils.splitCamelCase(String(key)), min, max)
      })
    }

    return { add, addAll, update }
  }
}
