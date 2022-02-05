import { AnimationStrategy } from '@va/engine'
import { genericStrategy } from '../generic'
import { VibrantOx } from '../../elements/vibrantOx'

export const bullHeadStrategy = (): AnimationStrategy.AnimationFactory =>
  genericStrategy({
    element: VibrantOx.create({ colored: true }),
    source: 'frequency'
  })
