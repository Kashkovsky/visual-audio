import { Atom, F } from '@grammarly/focal'
import { OutputStream, Rx } from '@va/engine'
import * as React from 'react'
import * as style from './recorder-switch.style'
import { createFFmpeg } from '@ffmpeg/ffmpeg'

export interface RecorderSwitchProps {
  readonly children: Rx.Observable<MediaStream>
  readonly armed?: boolean
}

export const RecorderSwitch = ({ children, armed }: RecorderSwitchProps): JSX.Element => {
  const enabled = Atom.create(false)
  const ff = createFFmpeg({ log: true })
  const ffmpeg = armed ? Rx.from(ff.load()).pipe(Rx.mapTo(ff)) : Rx.of(ff)

  return (
    <F.Fragment>
      <F.div
        className={style.button}
        data-active={enabled}
        onClick={() => enabled.modify(x => !x)}
      />
      {children.pipe(OutputStream.record(ffmpeg, enabled), Rx.mapTo(null), Rx.startWith(null))}
    </F.Fragment>
  )
}
