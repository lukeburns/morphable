const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve } = util
var OL_KEY_ID = onload.KEY_ID
let i = 0

function morphable (view) {
  if (typeof view !== 'function') return observable(view)
  
  let cached
  const id = i++
  const fn = function (state, init) {
    let reaction
    element = cached || init || view(morphable.raw(state))
    element.id = element.id || id
    
    return onload(element, function (el) {
      if (!cached) fn.emit('load', morphable.raw(state), el)
      cached = el
      
      if (reaction) return
      fn.emit('observe', morphable.raw(state), el)
      reaction = observe(() => {
        fn.emit('morph', morphable.raw(state), el)
        
        let update = view(state)
        update.id = update.id || id
        update.dataset[OL_KEY_ID] = el.dataset[OL_KEY_ID]
        
        morph(el, update)
      })
    }, el => {
      if (!reaction) return
      
      fn.emit('unobserve', morphable.raw(state), el)
      unobserve(reaction)
      reaction = null
      fn.emit('unload', morphable.raw(state), el) // todo: don't trigger unload if removed from dom temporarily due to parent morph. https://github.com/shama/on-load/issues/25
    }, id)
  }
  events.call(fn)
  Object.assign(fn, events.prototype)
  return fn
}

Object.assign(morphable, util)

module.exports = morphable