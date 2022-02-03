import { App3D } from './app'
// TODO: import in dev only to preserve change detection
import './strategy'
// const Main = () => <RecorderSwitch>{App3D()}</RecorderSwitch>

// ReactDOM.render(<Main />, document.getElementById('root'))

const sub = App3D().subscribe()
window.addEventListener('beforeunload', () => {
  console.log('unload')
  sub.unsubscribe()
})
