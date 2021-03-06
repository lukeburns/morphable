const onload = require('on-load')
const morph = require('nanomorph')
const util = require('@nx-js/observer-util')
const events = require('events')
const { observable, observe, unobserve, isObservable } = util
const KEY_ATTR = 'data-' + onload.KEY_ID
let id = 1

function morphable (view, opts={}) {
  if (typeof view !== 'function') return observable(view)

  let { reactiveView=true, observeListeners=false } = opts || {}

  let cache = new WeakMap()
  let reactions = new WeakMap()
  let int = 0

  const fn = function () {
    let self = this
    let args = Array.from(arguments)
    let index = isObservable(self) ? self : args[0]

    let rawArgs = args.map(state => morphable.raw(state))
    let rawSelf = isObservable(self) ? morphable.raw(self) : self
    let listenerArgs = observeListeners ? args : rawArgs
    let listenerSelf = observeListeners ? self : rawSelf

    let element
    if (cache.has(index)) {
      element = cache.get(index)
    } else {
      element = view.apply(rawSelf, rawArgs)
      if (!element.id) {
        if (fn.id) {
          if (int == 0) {
            element.id = fn.id
            int++
          } else {
            element.id = `${fn.id}-${int++}`
          }
        } else {
          element.id = id++
        }
      }
    }

    return onload(element, function (el) {
      if (isObservable(index)) {
        if (reactions.has(index)) return
        cache.set(index, el)
      }

      let init = false
      let old_id = el.id
      let reaction = observe(() => {
        if (!init || reactiveView) {
          fn.emit('premorph', el, ...listenerArgs, listenerSelf)
          let update = view.apply(self, args)
          update.id = update.id || old_id
          update.setAttribute(KEY_ATTR, (cache.get(index) || el).getAttribute(KEY_ATTR))
          morph(el, update)
        }
        if (init) {
          fn.emit('morph', el, ...listenerArgs, listenerSelf)
        } else {
          fn.emit('load', el, ...listenerArgs, listenerSelf)
          init = true
        }
      })

      if (isObservable(index)) {
        reactions.set(index, reaction)
      }
    }, el => {
      if (document.documentElement.contains(el) || !reactions.has(index)) return
      fn.emit('unload', el, ...listenerArgs, listenerSelf)
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
