import { App3D } from './app'
import './worker-hack.js'

// const Main = () => <RecorderSwitch>{App3D()}</RecorderSwitch>

// ReactDOM.render(<Main />, document.getElementById('root'))

App3D().subscribe()
