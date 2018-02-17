const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const { observe, unobserve } = util

function morphable (view) {
  console.log('load:', view.name)
  return function (state, init) {
    init = init || view(morphable.raw(state))
    let reaction
    return onload(init, function (el) {
      let reaction = observe(() => { 
        console.log('reaction for:', view.name, el)
        onload(morph(el, view(state)), null, function () {
          console.log('unload')
          unobserve(reaction)
        })
      })
    })
  }
}

Object.assign(morphable, util)

module.exports = morphable