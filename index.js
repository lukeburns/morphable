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
  
  const fn = function () {
    let args = Array.from(arguments)
    let rawArgs = args.map(state => morphable.raw(state))
    let element = cached || view.apply(self, rawArgs)
    element.id = element.id || id
    
    return onload(element, function (el) {
      if (reaction) return
      cached = el
      
      fn.emit('load', ...rawArgs, morphable.raw(self), el)
      reaction = observe(() => {
        fn.emit('morph', ...rawArgs, morphable.raw(self), el)
        
        let update = view.apply(self, args)
        update.id = update.id || id
        update.dataset[KEY_ID] = el.dataset[KEY_ID]
        
        morph(el, update)
      })
    }, el => {
      if (!reaction) return
      
      fn.emit('unload', ...rawArgs, morphable.raw(self), el)
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