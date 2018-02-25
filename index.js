const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const { observable, observe, unobserve } = util
let i = 0

function morphable (view) {
  if (typeof view !== 'function') return observable(view)
  const name = view.name || i++
  const fn = function (state, init) {
    init = init || view(morphable.raw(state))
    let reaction
    return onload(init, function (el) {
      if (morphable.log) console.log('load:', name, el)
      if (fn.onload) fn.onload(el)
      let reaction = observe(() => {
        if (morphable.log) console.log('morph:', name, el)
        onload(morph(el, view(state)), null, function (el) {
          if (morphable.log) console.log('unload:', name, el)
          if (fn.onunload) fn.onunload(el)
          unobserve(reaction)
        })
      })
    })
  }
  return fn
}

Object.assign(morphable, util)

module.exports = morphable