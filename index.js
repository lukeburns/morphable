const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve, isObservable } = util
const KEY_ATTR = 'data-' + onload.KEY_ID
let id = 1

function morphable (view, opts={}) {
  if (typeof view !== 'function') return observable(view)

  const { reactiveView=true, observeView=true, observeListeners=false } = opts || {}

  let cache = new WeakMap()
  let reactions = new WeakMap()
  let int = 1

  const fn = function () {
    let self = this
    let args = Array.from(arguments)
    let rawArgs = args.map(state => morphable.raw(state))
    let rawSelf = isObservable(self) ? morphable.raw(self) : self
    let index = isObservable(self) ? self : args[0]

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
        const listenerArgs = observeListeners ? args : rawArgs
        const listenerSelf = observeListeners ? self : rawSelf
        const viewArgs = observeView ? args : rawArgs
        const viewSelf = observeView ? self : rawSelf

        fn.emit('premorph', listenerSelf, el, ...listenerArgs)
        let update = view.apply(viewSelf, viewArgs)
        update.id = update.id || int
        update.setAttribute(KEY_ATTR, (cache.get(index) || el).getAttribute(KEY_ATTR))
        if (!init || reactiveView) {
          morph(el, update)
        }
        if (init) {
          fn.emit('morph', listenerSelf, el, ...listenerArgs)
        } else {
          fn.emit('load', listenerSelf, el, ...listenerArgs)
          init = true
        }
      })

      if (isObservable(index)) reactions.set(index, reaction)
    }, el => {
      if (!reactions.has(index)) return
      const listenerArgs = observeListeners ? args : rawArgs
      const listenerSelf = observeListeners ? self : rawSelf
      
      fn.emit('unload', listenerSelf, el, ...listenerArgs)
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
