import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App3D } from './app'
import { RecorderSwitch } from '@va/components'
// TODO: import in dev only to preserve change detection
import './strategy'

const Main = () => <RecorderSwitch>{App3D()}</RecorderSwitch>

ReactDOM.render(<Main />, document.getElementById('root'))
