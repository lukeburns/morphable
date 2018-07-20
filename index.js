const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve } = util
const KEY_ATTR = 'data-' + onload.KEY_ID
let i = 1

function morphable (view) {
  if (typeof view !== 'function') return observable(view)

  const id = i++
  let reaction
  let self = this
  let cache = new WeakMap()

  const fn = function () {
    let args = Array.from(arguments)
    let rawArgs = args.map(state => morphable.raw(state))
    let index = args[0]

    let element
    console.log(args[0])
    if (cache.has(index)) {
      element = cache.get(index)
    } else {
      element = view.apply(self, rawArgs)
    }
    element.id = element.id || id

    return onload(element, function (el) {
      if (reaction) return
      cache.set(index, el)

      let init = false
      reaction = observe(() => {
        fn.emit('premorph', morphable.raw(self), el, ...rawArgs)
        let update = view.apply(self, args)
        update.id = update.id || id
        update.setAttribute(KEY_ATTR, cache.get(index).getAttribute(KEY_ATTR))
        morph(el, update)
        if (init) {
          fn.emit('morph', morphable.raw(self), el, ...rawArgs)
        } else {
          fn.emit('load', morphable.raw(self), el, ...rawArgs)
          init = true
        }
      })
    }, el => {
      if (!reaction) return
      fn.emit('unload', morphable.raw(self), el, ...rawArgs)
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
