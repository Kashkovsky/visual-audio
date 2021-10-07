export type Opaque<LABEL extends string, T> = T & { readonly __TYPE__: LABEL }
