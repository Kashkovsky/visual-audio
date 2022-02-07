export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)
export const splitCamelCase = (string: string) =>
  capitalize(string.replace(/([a-z])([A-Z])/g, '$1 $2'))
