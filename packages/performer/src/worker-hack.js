const W = self.Worker
self.Worker = function (url, options) {
  const code = `
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  var window = globalObject
  importScripts = (function(){return this.apply(self,[].slice.call(arguments).filter(function(x){return !/\\.css$/i.test(x)}).map(v => v.startsWith('./') ? '${
    window.location.href
  }' + v.slice(2) : v))}).bind(importScripts)\nimportScripts(${JSON.stringify(url)})`

  return new W(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), options)
}
