import { Atom, F } from '@grammarly/focal'
import { OutputStream, Rx } from '@va/engine'
import * as React from 'react'
import * as style from './recorder-switch.style'

export interface RecorderSwitchProps {
  readonly children: Rx.Observable<MediaStream>
}

export const RecorderSwitch = ({ children }: RecorderSwitchProps): JSX.Element => {
  const enabled = Atom.create(false)
  return (
    <F.Fragment>
      <F.div
        className={style.button}
        data-active={enabled}
        onClick={() => enabled.modify(x => !x)}
      />
      {children.pipe(OutputStream.record(enabled), Rx.mapTo(null), Rx.startWith(null))}
    </F.Fragment>
  )
}
