import { AnimationStrategy, VAWorker, WorkerMessage } from '@va/engine'
import { pipe } from 'fp-ts/es6/function'
import * as RE from 'fp-ts/es6/ReaderEither'
import * as E from 'fp-ts/es6/Either'
import * as visuals from './strategy'

const getAnimation: RE.ReaderEither<
  WorkerMessage.Start,
  Error,
  AnimationStrategy.AnimationFactory
> = ({ strategy, config }) =>
  pipe(
    visuals[strategy as keyof typeof visuals] as (c: any) => AnimationStrategy.AnimationFactory,
    E.fromNullable(new Error(`Failed to import strategy by name: ${strategy}`)),
    E.map(s => s(config))
  )

const handleMessage = VAWorker.createInstance(getAnimation)

self.addEventListener('message', handleMessage)
