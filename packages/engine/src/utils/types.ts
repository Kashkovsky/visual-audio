import * as IO from 'fp-ts/es6/IO'
import { Reader } from 'fp-ts/es6/Reader'
import Konva from 'konva'
export type Opaque<LABEL extends string, T> = T & { readonly __TYPE__: LABEL }

type globalCompositeOperationType =
  | ''
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

type Filter = (this: Node, imageData: ImageData) => void
export interface NodeConfig {
  x?: number
  y?: number
  width?: number
  height?: number
  visible?: boolean
  listening?: boolean
  id?: string
  name?: string
  opacity?: number
  scale?: Konva.Vector2d
  scaleX?: number
  scaleY?: number
  rotation?: number
  rotationDeg?: number
  offset?: Konva.Vector2d
  offsetX?: number
  offsetY?: number
  draggable?: boolean
  dragDistance?: number
  dragBoundFunc?: (this: Node, pos: Konva.Vector2d) => Konva.Vector2d
  preventDefault?: boolean
  globalCompositeOperation?: globalCompositeOperationType
  filters?: Array<Filter>
}

export enum ShapeKind {
  circle = 'circle',
  rect = 'rect',
  polygon = 'polygon',
  ellipse = 'ellipse',
  wedge = 'wedge',
  sprite = 'sprite',
  image = 'image',
  text = 'text',
  textPath = 'textPath',
  ring = 'ring',
  star = 'star',
  arc = 'arc',
  path = 'path',
  arrow = 'arrow',
  custom = 'custom'
}

type StrictConfig<T extends Konva.NodeConfig> = Omit<T, keyof Konva.NodeConfig> & NodeConfig

export type Config<K extends ShapeKind> = K extends ShapeKind.circle
  ? StrictConfig<Konva.CircleConfig>
  : K extends ShapeKind.ellipse
  ? StrictConfig<Konva.EllipseConfig>
  : K extends ShapeKind.rect
  ? StrictConfig<Konva.RectConfig>
  : K extends ShapeKind.polygon
  ? StrictConfig<Konva.RegularPolygonConfig>
  : K extends ShapeKind.wedge
  ? StrictConfig<Konva.WedgeConfig>
  : K extends ShapeKind.sprite
  ? StrictConfig<Konva.SpriteConfig>
  : K extends ShapeKind.image
  ? StrictConfig<Konva.ImageConfig>
  : K extends ShapeKind.text
  ? StrictConfig<Konva.TextConfig>
  : K extends ShapeKind.textPath
  ? StrictConfig<Konva.TextPathConfig>
  : K extends ShapeKind.ring
  ? StrictConfig<Konva.RingConfig>
  : K extends ShapeKind.star
  ? StrictConfig<Konva.StarConfig>
  : K extends ShapeKind.arc
  ? StrictConfig<Konva.ArcConfig>
  : K extends ShapeKind.path
  ? StrictConfig<Konva.PathConfig>
  : K extends ShapeKind.arrow
  ? StrictConfig<Konva.ArrowConfig>
  : K extends ShapeKind.custom
  ? StrictConfig<Konva.ShapeConfig>
  : never

export type Shape<K extends ShapeKind> = K extends ShapeKind.circle
  ? Konva.Circle
  : K extends ShapeKind.ellipse
  ? Konva.Ellipse
  : K extends ShapeKind.rect
  ? Konva.Rect
  : K extends ShapeKind.polygon
  ? Konva.RegularPolygon
  : K extends ShapeKind.wedge
  ? Konva.Wedge
  : K extends ShapeKind.sprite
  ? Konva.Sprite
  : K extends ShapeKind.image
  ? Konva.Image
  : K extends ShapeKind.text
  ? Konva.Text
  : K extends ShapeKind.textPath
  ? Konva.TextPath
  : K extends ShapeKind.ring
  ? Konva.Ring
  : K extends ShapeKind.star
  ? Konva.Star
  : K extends ShapeKind.arc
  ? Konva.Arc
  : K extends ShapeKind.path
  ? Konva.Path
  : K extends ShapeKind.arrow
  ? Konva.Arrow
  : K extends ShapeKind.custom
  ? Konva.Shape
  : never

export type ShapeParams<K extends ShapeKind> = {
  kind: K
  config: Config<K>
}

export namespace ShapeParams {
  export function match<T>(
    circle: T,
    rect: T,
    polygon: T,
    ellipse: T,
    wedge: T,
    sprite: T,
    image: T,
    text: T,
    textPath: T,
    ring: T,
    star: T,
    arc: T,
    path: T,
    arrow: T,
    custom: T
  ): Reader<ShapeKind, T> {
    return matchL(
      IO.of(circle),
      IO.of(rect),
      IO.of(polygon),
      IO.of(ellipse),
      IO.of(wedge),
      IO.of(sprite),
      IO.of(image),
      IO.of(text),
      IO.of(textPath),
      IO.of(ring),
      IO.of(star),
      IO.of(arc),
      IO.of(path),
      IO.of(arrow),
      IO.of(custom)
    )
  }
  export function matchL<T>(
    circle: IO.IO<T>,
    rect: IO.IO<T>,
    polygon: IO.IO<T>,
    ellipse: IO.IO<T>,
    wedge: IO.IO<T>,
    sprite: IO.IO<T>,
    image: IO.IO<T>,
    text: IO.IO<T>,
    textPath: IO.IO<T>,
    ring: IO.IO<T>,
    star: IO.IO<T>,
    arc: IO.IO<T>,
    path: IO.IO<T>,
    arrow: IO.IO<T>,
    custom: IO.IO<T>
  ): Reader<ShapeKind, T> {
    return kind => {
      switch (kind) {
        case ShapeKind.circle:
          return circle()
        case ShapeKind.rect:
          return rect()
        case ShapeKind.polygon:
          return polygon()
        case ShapeKind.ellipse:
          return ellipse()
        case ShapeKind.wedge:
          return wedge()
        case ShapeKind.sprite:
          return sprite()
        case ShapeKind.image:
          return image()
        case ShapeKind.text:
          return text()
        case ShapeKind.textPath:
          return textPath()
        case ShapeKind.ring:
          return ring()
        case ShapeKind.star:
          return star()
        case ShapeKind.arc:
          return arc()
        case ShapeKind.path:
          return path()
        case ShapeKind.arrow:
          return arrow()

        default:
          return custom()
      }
    }
  }
  export const toShape =
    <K extends ShapeKind>(params: ShapeParams<K>) =>
    (config: Config<K> | NodeConfig): Konva.Shape =>
      matchL(
        () =>
          new Konva.Circle({
            ...(params.config as Konva.CircleConfig),
            ...(config as Konva.CircleConfig)
          }),
        () =>
          new Konva.Rect({
            ...(params.config as Konva.ShapeConfig),
            ...(config as Konva.ShapeConfig)
          }),
        () =>
          new Konva.RegularPolygon({
            ...(params.config as Konva.RegularPolygonConfig),
            ...(config as Konva.RegularPolygonConfig)
          }),
        () =>
          new Konva.Ellipse({
            ...(params.config as Konva.EllipseConfig),
            ...(config as Konva.EllipseConfig)
          }),
        () =>
          new Konva.Wedge({
            ...(params.config as Konva.WedgeConfig),
            ...(config as Konva.WedgeConfig)
          }),
        () =>
          new Konva.Sprite({
            ...(params.config as Konva.SpriteConfig),
            ...(config as Konva.SpriteConfig)
          }),
        () =>
          new Konva.Image({
            ...(params.config as Konva.ImageConfig),
            ...(config as Konva.ImageConfig)
          }),
        () =>
          new Konva.Text({
            ...(params.config as Konva.TextConfig),
            ...(config as Konva.TextConfig)
          }),
        () =>
          new Konva.TextPath({
            ...(params.config as Konva.TextPathConfig),
            ...(config as Konva.TextPathConfig)
          }),
        () =>
          new Konva.Ring({
            ...(params.config as Konva.RingConfig),
            ...(config as Konva.RingConfig)
          }),
        () =>
          new Konva.Star({
            ...(params.config as Konva.StarConfig),
            ...(config as Konva.StarConfig)
          }),
        () =>
          new Konva.Arc({
            ...(params.config as Konva.ArcConfig),
            ...(config as Konva.ArcConfig)
          }),
        () =>
          new Konva.Path({
            ...(params.config as Konva.PathConfig),
            ...(config as Konva.PathConfig)
          }),
        () =>
          new Konva.Arrow({
            ...(params.config as Konva.ArrowConfig),
            ...(config as Konva.ArrowConfig)
          }),
        () =>
          new Konva.Shape({
            ...(params.config as Konva.ShapeConfig),
            ...(config as Konva.ShapeConfig)
          })
      )(params.kind)
}
