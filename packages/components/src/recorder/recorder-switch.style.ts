import * as CSS from 'typestyle'

export const button = CSS.style({
  position: 'absolute',
  zIndex: 1,
  bottom: 10,
  right: 10,
  width: 40,
  height: 40,
  borderRadius: '50%',
  opacity: 0,
  $nest: {
    '&:hover': {
      opacity: 1,
      background: 'green'
    },
    '&[data-active=true]': {
      opacity: 1,
      background: 'red'
    }
  }
})
