import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App3D } from './app'
import { RecorderSwitch } from '@va/components'

const Main = () => <RecorderSwitch>{App3D()}</RecorderSwitch>

ReactDOM.render(<Main />, document.getElementById('root'))
