import { Reader } from 'fp-ts/es6/Reader'

export const withDefault =
  <T>(def: Required<T>): Reader<T, Required<T>> =>
  (obj: T) => ({ ...def, ...obj })

export function fromEntries<T>(entries: Iterable<[keyof T, T[keyof T]]>): T {
  return Array.from(entries).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as T)
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]
export function entries<T extends Object>(object: T) {
  return Object.entries(object) as Entries<T>
}
