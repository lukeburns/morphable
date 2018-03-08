const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve } = util
var KEY_ID = onload.KEY_ID
let i = 1

function morphable (view) {
  if (typeof view !== 'function') return observable(view)
  
  const id = i++
  let reaction
  let cached
  let self = this
  
  const fn = function (state, init) {
    let element = cached || init || view.call(morphable.raw(self), morphable.raw(state))
    element.id = element.id || id
    
    return onload(element, function (el) {
      if (reaction) return
      cached = el
      
      fn.emit('load', morphable.raw(state), el, morphable.raw(self))
      reaction = observe(() => {
        fn.emit('morph', morphable.raw(state), el, morphable.raw(self))
        
        let update = view.call(self, state)
        update.id = update.id || id
        update.dataset[KEY_ID] = el.dataset[KEY_ID]
        
        morph(el, update)
      })
    }, el => {
      if (!reaction) return
      
      fn.emit('unload', morphable.raw(state), el, morphable.raw(self))
      unobserve(reaction)
      reaction = null
    }, id)
  }
  events.call(fn)
  Object.assign(fn, events.prototype)
  return fn
}

Object.assign(morphable, util)

module.exports = morphable