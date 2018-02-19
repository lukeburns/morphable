const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const { observable, observe, unobserve } = util
let i = 0

function morphable (view) {
  if (typeof view !== 'function') return observable(view)
  let name = i++
  
  if (morphable.log) console.log('load:', view.name || name)
  return function (state, init) {
    init = init || view(morphable.raw(state))
    let reaction
    return onload(init, function (el) {
      let reaction = observe(() => { 
        if (morphable.log) console.log('reaction for:', view.name || name, el)
        onload(morph(el, view(state)), null, function () {
          if (morphable.log) console.log('unload:', view.name || name)
          unobserve(reaction)
        })
      })
    })
  }
}

Object.assign(morphable, util)

module.exports = morphable