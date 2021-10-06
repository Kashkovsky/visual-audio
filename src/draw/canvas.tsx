import { flow } from 'fp-ts/es6/function'
import * as React from 'react'
import * as O from 'fp-ts/es6/Option'
import Rx from '../rx'
export const Drawer = ({ onContextReady }: { onContextReady: (ctx: CanvasRenderingContext2D) => Rx.Observable<any> }) => {
	const sub = React.useRef<Rx.Subscription>()
	React.useEffect(() => () => sub.current?.unsubscribe())
	
	return <canvas ref={flow(
		O.fromNullable,
		O.chain(c => O.fromNullable(c.getContext('2d'))),
		O.map(onContextReady),
		O.map(s => sub.current = s.subscribe())
	)} width={document.body.clientWidth} height={document.body.clientHeight} />
}