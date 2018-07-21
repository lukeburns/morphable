const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve, isObservable } = util
const KEY_ATTR = 'data-' + onload.KEY_ID
let id = 1

function morphable (view) {
  if (typeof view !== 'function') return observable(view)

  let self = this
  let cache = new WeakMap()
  let reactions = new WeakMap()
  let int = 1

  const fn = function () {
    let args = Array.from(arguments)
    let rawArgs = args.map(state => morphable.raw(state))
    let index = args[0]

    let element
    if (cache.has(index)) {
      element = cache.get(index)
    } else {
      element = view.apply(self, rawArgs)
      element.id = id++
    }

    return onload(element, function (el) {
      if (isObservable(index)) {
        if (reactions.has(index)) return
        cache.set(index, el)
      }

      let init = false
      let int = el.id
      let reaction = observe(() => {
        fn.emit('premorph', morphable.raw(self), el, ...rawArgs)
        let update = view.apply(self, args)
        update.id = update.id || int
        update.setAttribute(KEY_ATTR, (cache.get(index) || el).getAttribute(KEY_ATTR))
        morph(el, update)
        if (init) {
          fn.emit('morph', morphable.raw(self), el, ...rawArgs)
        } else {
          fn.emit('load', morphable.raw(self), el, ...rawArgs)
          init = true
        }
      })

      if (isObservable(index)) reactions.set(index, reaction)
    }, el => {
      if (!reactions.has(index)) return
      fn.emit('unload', morphable.raw(self), el, ...rawArgs)
      unobserve(reactions.get(index))
      reactions.delete(index)
    }, id)
  }
  events.call(fn)
  Object.assign(fn, events.prototype)
  return fn
}

Object.assign(morphable, util)

module.exports = morphable
