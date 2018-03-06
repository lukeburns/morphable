"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {}, {}], 2: [function (require, module, exports) {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
    }
    module.exports = EventEmitter;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function (n) {
      if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    };

    EventEmitter.prototype.emit = function (type) {
      var er, handler, len, args, i, listeners;

      if (!this._events) this._events = {};

      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          } else {
            // At least give some kind of context to the user
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
            err.context = er;
            throw err;
          }
        }
      }

      handler = this._events[type];

      if (isUndefined(handler)) return false;

      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++) {
          listeners[i].apply(this, args);
        }
      }

      return true;
    };

    EventEmitter.prototype.addListener = function (type, listener) {
      var m;

      if (!isFunction(listener)) throw TypeError('listener must be a function');

      if (!this._events) this._events = {};

      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

      if (!this._events[type])
        // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;else if (isObject(this._events[type]))
        // If we've already got an array, just append.
        this._events[type].push(listener);else
        // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];

      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
          }
        }
      }

      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function (type, listener) {
      if (!isFunction(listener)) throw TypeError('listener must be a function');

      var fired = false;

      function g() {
        this.removeListener(type, g);

        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }

      g.listener = listener;
      this.on(type, g);

      return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function (type, listener) {
      var list, position, length, i;

      if (!isFunction(listener)) throw TypeError('listener must be a function');

      if (!this._events || !this._events[type]) return this;

      list = this._events[type];
      length = list.length;
      position = -1;

      if (list === listener || isFunction(list.listener) && list.listener === listener) {
        delete this._events[type];
        if (this._events.removeListener) this.emit('removeListener', type, listener);
      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener || list[i].listener && list[i].listener === listener) {
            position = i;
            break;
          }
        }

        if (position < 0) return this;

        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }

        if (this._events.removeListener) this.emit('removeListener', type, listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function (type) {
      var key, listeners;

      if (!this._events) return this;

      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }

      listeners = this._events[type];

      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        while (listeners.length) {
          this.removeListener(type, listeners[listeners.length - 1]);
        }
      }
      delete this._events[type];

      return this;
    };

    EventEmitter.prototype.listeners = function (type) {
      var ret;
      if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
      return ret;
    };

    EventEmitter.prototype.listenerCount = function (type) {
      if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
      }
      return 0;
    };

    EventEmitter.listenerCount = function (emitter, type) {
      return emitter.listenerCount(type);
    };

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isObject(arg) {
      return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
    }

    function isUndefined(arg) {
      return arg === void 0;
    }
  }, {}], 3: [function (require, module, exports) {
    var html = {};
    var _ = require('../');

    var state = _({ list: [] });

    var list = _(function (state) {
      return function () {
        var ac = require('/Users/lburns/Dropbox/morphable/node_modules/yo-yoify/lib/appendChild.js');
        var bel0 = document.createElement("ul");
        ac(bel0, ["\n  ", arguments[0], "\n"]);
        return bel0;
      }(state.list.map(function (num) {
        return function () {
          var ac = require('/Users/lburns/Dropbox/morphable/node_modules/yo-yoify/lib/appendChild.js');
          var bel0 = document.createElement("li");
          ac(bel0, [arguments[0]]);
          return bel0;
        }(num);
      }));
    });

    var body = _(function (state) {
      return function () {
        var ac = require('/Users/lburns/Dropbox/morphable/node_modules/yo-yoify/lib/appendChild.js');
        var bel1 = document.createElement("body");
        var bel0 = document.createElement("button");
        bel0["onclick"] = arguments[0];
        ac(bel0, ["Append random number"]);
        ac(bel1, ["\n  ", bel0, "\n  ", arguments[1], "\n"]);
        return bel1;
      }(function () {
        return state.list.push(Math.random());
      }, list(state));
    });

    body(state, document.body);

    list.on('load', function () {
      return console.log('loaded list');
    });
    list.on('morph', function () {
      return console.log('morphed list');
    });
    list.on('unload', function () {
      return console.log('unloaded list');
    });
  }, { "../": 4, "/Users/lburns/Dropbox/morphable/node_modules/yo-yoify/lib/appendChild.js": 13 }], 4: [function (require, module, exports) {
    var onload = require('on-load');
    var morph = require('nanomorph');
    var util = require('@nx-js/observer-util');
    var events = require('events');
    var observable = util.observable,
        observe = util.observe,
        unobserve = util.unobserve;

    var KEY_ID = onload.KEY_ID;
    var i = 1;

    function morphable(view) {
      if (typeof view !== 'function') return observable(view);

      var id = i++;
      var reaction = void 0;
      var cached = void 0;

      var fn = function fn(state, init) {
        var element = cached || init || view(morphable.raw(state));
        element.id = element.id || id;

        return onload(element, function (el) {
          if (reaction) return;
          cached = el;

          fn.emit('load', morphable.raw(state), el);
          reaction = observe(function () {
            fn.emit('morph', morphable.raw(state), el);

            var update = view(state);
            update.id = update.id || id;
            update.dataset[KEY_ID] = el.dataset[KEY_ID];

            morph(el, update);
          });
        }, function (el) {
          if (!reaction) return;

          fn.emit('unload', morphable.raw(state), el);
          unobserve(reaction);
          reaction = null;
        }, id);
      };
      events.call(fn);
      Object.assign(fn, events.prototype);
      return fn;
    }

    Object.assign(morphable, util);

    module.exports = morphable;
  }, { "@nx-js/observer-util": 5, "events": 2, "nanomorph": 9, "on-load": 12 }], 5: [function (require, module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', { value: true });

    var connectionStore = new WeakMap();
    var ITERATION_KEY = Symbol('iteration key');

    function storeObservable(obj) {
      // this will be used to save (obj.key -> reaction) connections later
      connectionStore.set(obj, Object.create(null));
    }

    function registerReactionForOperation(reaction, ref) {
      var target = ref.target;
      var key = ref.key;
      var type = ref.type;

      if (type === 'iterate') {
        key = ITERATION_KEY;
      }

      var reactionsForObj = connectionStore.get(target);
      var reactionsForKey = reactionsForObj[key];
      if (!reactionsForKey) {
        reactionsForObj[key] = reactionsForKey = new Set();
      }
      // save the fact that the key is used by the reaction during its current run
      if (!reactionsForKey.has(reaction)) {
        reactionsForKey.add(reaction);
        reaction.cleaners.push(reactionsForKey);
      }
    }

    function getReactionsForOperation(ref) {
      var target = ref.target;
      var key = ref.key;
      var type = ref.type;

      var reactionsForTarget = connectionStore.get(target);
      var reactionsForKey = new Set();

      if (type === 'clear') {
        for (var key$1 in reactionsForTarget) {
          addReactionsForKey(reactionsForKey, reactionsForTarget, key$1);
        }
      } else {
        addReactionsForKey(reactionsForKey, reactionsForTarget, key);
      }

      if (type === 'add' || type === 'delete' || type === 'clear') {
        var iterationKey = Array.isArray(target) ? 'length' : ITERATION_KEY;
        addReactionsForKey(reactionsForKey, reactionsForTarget, iterationKey);
      }

      return reactionsForKey;
    }

    function addReactionsForKey(reactionsForKey, reactionsForTarget, key) {
      var reactions = reactionsForTarget[key];
      reactions && reactions.forEach(reactionsForKey.add, reactionsForKey);
    }

    function releaseReaction(reaction) {
      if (reaction.cleaners) {
        reaction.cleaners.forEach(releaseReactionKeyConnection, reaction);
      }
      reaction.cleaners = [];
    }

    function releaseReactionKeyConnection(reactionsForKey) {
      reactionsForKey.delete(this);
    }

    var runningReaction;
    var isDebugging = false;

    function runAsReaction(reaction, fn, context, args) {
      // do not build reactive relations, if the reaction is unobserved
      if (reaction.unobserved) {
        return fn.apply(context, args);
      }

      // release the (obj -> key -> reactions) connections
      // and reset the cleaner connections
      releaseReaction(reaction);

      try {
        // set the reaction as the currently running one
        // this is required so that we can create (observable.prop -> reaction) pairs in the get trap
        runningReaction = reaction;
        return fn.apply(context, args);
      } finally {
        // always remove the currently running flag from the reaction when it stops execution
        runningReaction = undefined;
      }
    }

    // register the currently running reaction to be queued again on obj.key mutations
    function registerRunningReactionForOperation(operation) {
      if (runningReaction) {
        debugOperation(runningReaction, operation);
        registerReactionForOperation(runningReaction, operation);
      }
    }

    function queueReactionsForOperation(operation) {
      // iterate and queue every reaction, which is triggered by obj.key mutation
      getReactionsForOperation(operation).forEach(queueReaction, operation);
    }

    function queueReaction(reaction) {
      debugOperation(reaction, this);
      // queue the reaction for later execution or run it immediately
      if (typeof reaction.scheduler === 'function') {
        reaction.scheduler(reaction);
      } else if (_typeof(reaction.scheduler) === 'object') {
        reaction.scheduler.add(reaction);
      } else {
        reaction();
      }
    }

    function debugOperation(reaction, operation) {
      if (reaction.debugger && !isDebugging) {
        try {
          isDebugging = true;
          reaction.debugger(operation);
        } finally {
          isDebugging = false;
        }
      }
    }

    function hasRunningReaction() {
      return runningReaction !== undefined;
    }

    var IS_REACTION = Symbol('is reaction');

    function observe(fn, options) {
      if (options === void 0) options = {};

      // wrap the passed function in a reaction, if it is not already one
      var reaction = fn[IS_REACTION] ? fn : function reaction() {
        return runAsReaction(reaction, fn, this, arguments);
      };
      // save the scheduler and debugger on the reaction
      reaction.scheduler = options.scheduler;
      reaction.debugger = options.debugger;
      // save the fact that this is a reaction
      reaction[IS_REACTION] = true;
      // run the reaction once if it is not a lazy one
      if (!options.lazy) {
        reaction();
      }
      return reaction;
    }

    function unobserve(reaction) {
      // do nothing, if the reaction is already unobserved
      if (!reaction.unobserved) {
        // indicate that the reaction should not be triggered any more
        reaction.unobserved = true;
        // release (obj -> key -> reaction) connections
        releaseReaction(reaction);
      }
      // unschedule the reaction, if it is scheduled
      if (_typeof(reaction.scheduler) === 'object') {
        reaction.scheduler.delete(reaction);
      }
    }

    var proxyToRaw = new WeakMap();
    var rawToProxy = new WeakMap();

    var getPrototypeOf = Object.getPrototypeOf;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var instrumentations = {
      has: function has(key) {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, key: key, type: 'has' });
        return proto.has.apply(target, arguments);
      },
      get: function get(key) {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, key: key, type: 'get' });
        return proto.get.apply(target, arguments);
      },
      add: function add(key) {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        var hadKey = proto.has.call(target, key);
        // forward the operation before queueing reactions
        var result = proto.add.apply(target, arguments);
        if (!hadKey) {
          queueReactionsForOperation({ target: target, key: key, value: key, type: 'add' });
        }
        return result;
      },
      set: function set(key, value) {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        var hadKey = proto.has.call(target, key);
        var oldValue = proto.get.call(target, key);
        // forward the operation before queueing reactions
        var result = proto.set.apply(target, arguments);
        if (!hadKey) {
          queueReactionsForOperation({ target: target, key: key, value: value, type: 'add' });
        } else if (value !== oldValue) {
          queueReactionsForOperation({ target: target, key: key, value: value, oldValue: oldValue, type: 'set' });
        }
        return result;
      },
      delete: function delete$1(key) {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        var hadKey = proto.has.call(target, key);
        var oldValue = proto.get ? proto.get.call(target, key) : undefined;
        // forward the operation before queueing reactions
        var result = proto.delete.apply(target, arguments);
        if (hadKey) {
          queueReactionsForOperation({ target: target, key: key, oldValue: oldValue, type: 'delete' });
        }
        return result;
      },
      clear: function clear() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        var hadItems = target.size !== 0;
        var oldTarget = target instanceof Map ? new Map(target) : new Set(target);
        // forward the operation before queueing reactions
        var result = proto.clear.apply(target, arguments);
        if (hadItems) {
          queueReactionsForOperation({ target: target, oldTarget: oldTarget, type: 'clear' });
        }
        return result;
      },
      forEach: function forEach() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, type: 'iterate' });
        return proto.forEach.apply(target, arguments);
      },
      keys: function keys() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, type: 'iterate' });
        return proto.keys.apply(target, arguments);
      },
      values: function values() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, type: 'iterate' });
        return proto.values.apply(target, arguments);
      },
      entries: function entries() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, type: 'iterate' });
        return proto.entries.apply(target, arguments);
      },
      get size() {
        var target = proxyToRaw.get(this);
        var proto = getPrototypeOf(this);
        registerRunningReactionForOperation({ target: target, type: 'iterate' });
        return Reflect.get(proto, 'size', target);
      }
    };
    instrumentations[Symbol.iterator] = function () {
      var target = proxyToRaw.get(this);
      var proto = getPrototypeOf(this);
      registerRunningReactionForOperation({ target: target, type: 'iterate' });
      return proto[Symbol.iterator].apply(target, arguments);
    };

    var collectionHandlers = {
      get: function get(target, key, receiver) {
        // instrument methods and property accessors to be reactive
        target = hasOwnProperty.call(instrumentations, key) ? instrumentations : target;
        return Reflect.get(target, key, receiver);
      }
    };

    // simple objects are not wrapped by Proxies, neither instrumented
    var dontInstrument = new Set([Date, RegExp]);

    // built-in object can not be wrapped by Proxies
    // their methods expect the object instance as the 'this' instead of the Proxy wrapper
    // complex objects are wrapped with a Proxy of instrumented methods
    // which switch the proxy to the raw object and to add reactive wiring
    var handlers = new Map([[Map, collectionHandlers], [Set, collectionHandlers], [WeakMap, collectionHandlers], [WeakSet, collectionHandlers]]);

    function shouldInstrument(obj) {
      if (typeof Node === 'function' && obj instanceof Node) {
        return false;
      }
      return !dontInstrument.has(obj.constructor);
    }

    function getHandlers(obj) {
      return handlers.get(obj.constructor);
    }

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

    // intercept get operations on observables to know which reaction uses their properties
    function get(target, key, receiver) {
      var result = Reflect.get(target, key, receiver);
      // do not register (observable.prop -> reaction) pairs for these cases
      if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === 'symbol' || typeof result === 'function') {
        return result;
      }
      // register and save (observable.prop -> runningReaction)
      registerRunningReactionForOperation({ target: target, key: key, receiver: receiver, type: 'get' });
      // if we are inside a reaction and observable.prop is an object wrap it in an observable too
      // this is needed to intercept property access on that object too (dynamic observable tree)
      if (hasRunningReaction() && (typeof result === "undefined" ? "undefined" : _typeof(result)) === 'object' && result !== null) {
        return observable(result);
      }
      // otherwise return the observable wrapper if it is already created and cached or the raw object
      return rawToProxy.get(result) || result;
    }

    function has(target, key) {
      var result = Reflect.has(target, key);
      // do not register (observable.prop -> reaction) pairs for these cases
      if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === 'symbol') {
        return result;
      }
      // register and save (observable.prop -> runningReaction)
      registerRunningReactionForOperation({ target: target, key: key, type: 'has' });
      return result;
    }

    function ownKeys(target) {
      registerRunningReactionForOperation({ target: target, type: 'iterate' });
      return Reflect.ownKeys(target);
    }

    // intercept set operations on observables to know when to trigger reactions
    function set(target, key, value, receiver) {
      // make sure to do not pollute the raw object with observables
      if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' && value !== null) {
        value = proxyToRaw.get(value) || value;
      }
      // save if the object had a descriptor for this key
      var hadKey = hasOwnProperty$1.call(target, key);
      // save if the value changed because of this set operation
      var oldValue = target[key];
      // execute the set operation before running any reaction
      var result = Reflect.set(target, key, value, receiver);
      // emit a warning and do not queue anything when another reaction is queued
      // from an already running reaction
      if (hasRunningReaction()) {
        console.error("Mutating observables in reactions is forbidden. You set " + key + " to " + value + ".");
        return result;
      }
      // do not queue reactions if it is a symbol keyed property
      // or the target of the operation is not the raw receiver
      // (possible because of prototypal inheritance)
      if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === 'symbol' || target !== proxyToRaw.get(receiver)) {
        return result;
      }

      // queue a reaction if it's a new property or its value changed
      if (!hadKey) {
        queueReactionsForOperation({ target: target, key: key, value: value, receiver: receiver, type: 'add' });
      } else if (value !== oldValue) {
        queueReactionsForOperation({
          target: target,
          key: key,
          value: value,
          oldValue: oldValue,
          receiver: receiver,
          type: 'set'
        });
      }
      return result;
    }

    function deleteProperty(target, key) {
      // save if the object had the key
      var hadKey = hasOwnProperty$1.call(target, key);
      var oldValue = target[key];
      // execute the delete operation before running any reaction
      var result = Reflect.deleteProperty(target, key);
      // only queue reactions for non symbol keyed property delete which resulted in an actual change
      if ((typeof key === "undefined" ? "undefined" : _typeof(key)) !== 'symbol' && hadKey) {
        queueReactionsForOperation({ target: target, key: key, oldValue: oldValue, type: 'delete' });
      }
      return result;
    }

    var baseHandlers = { get: get, has: has, ownKeys: ownKeys, set: set, deleteProperty: deleteProperty };

    function observable(obj) {
      if (obj === void 0) obj = {};

      // if it is already an observable or it should not be wrapped, return it
      if (proxyToRaw.has(obj) || !shouldInstrument(obj)) {
        return obj;
      }
      // if it already has a cached observable wrapper, return it
      // otherwise create a new observable
      return rawToProxy.get(obj) || createObservable(obj);
    }

    function createObservable(obj) {
      // if it is a complex built-in object or a normal object, wrap it
      var handlers = getHandlers(obj) || baseHandlers;
      var observable = new Proxy(obj, handlers);
      // save these to switch between the raw object and the wrapped object with ease later
      rawToProxy.set(obj, observable);
      proxyToRaw.set(observable, obj);
      // init basic data structures to save and cleanup later (observable.prop -> reaction) connections
      storeObservable(obj);
      return observable;
    }

    function isObservable(obj) {
      return proxyToRaw.has(obj);
    }

    function raw(obj) {
      return proxyToRaw.get(obj) || obj;
    }

    exports.observe = observe;
    exports.unobserve = unobserve;
    exports.observable = observable;
    exports.isObservable = isObservable;
    exports.raw = raw;
  }, {}], 6: [function (require, module, exports) {
    (function (global) {
      var topLevel = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
      var minDoc = require('min-document');

      var doccy;

      if (typeof document !== 'undefined') {
        doccy = document;
      } else {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

        if (!doccy) {
          doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
        }
      }

      module.exports = doccy;
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, { "min-document": 1 }], 7: [function (require, module, exports) {
    (function (global) {
      var win;

      if (typeof window !== "undefined") {
        win = window;
      } else if (typeof global !== "undefined") {
        win = global;
      } else if (typeof self !== "undefined") {
        win = self;
      } else {
        win = {};
      }

      module.exports = win;
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, {}], 8: [function (require, module, exports) {
    assert.notEqual = notEqual;
    assert.notOk = notOk;
    assert.equal = equal;
    assert.ok = assert;

    module.exports = assert;

    function equal(a, b, m) {
      assert(a == b, m); // eslint-disable-line eqeqeq
    }

    function notEqual(a, b, m) {
      assert(a != b, m); // eslint-disable-line eqeqeq
    }

    function notOk(t, m) {
      assert(!t, m);
    }

    function assert(t, m) {
      if (!t) throw new Error(m || 'AssertionError');
    }
  }, {}], 9: [function (require, module, exports) {
    var assert = require('assert');
    var morph = require('./lib/morph');

    var TEXT_NODE = 3;
    // var DEBUG = false

    module.exports = nanomorph;

    // Morph one tree into another tree
    //
    // no parent
    //   -> same: diff and walk children
    //   -> not same: replace and return
    // old node doesn't exist
    //   -> insert new node
    // new node doesn't exist
    //   -> delete old node
    // nodes are not the same
    //   -> diff nodes and apply patch to old node
    // nodes are the same
    //   -> walk all child nodes and append to old node
    function nanomorph(oldTree, newTree) {
      // if (DEBUG) {
      //   console.log(
      //   'nanomorph\nold\n  %s\nnew\n  %s',
      //   oldTree && oldTree.outerHTML,
      //   newTree && newTree.outerHTML
      // )
      // }
      assert.equal(typeof oldTree === "undefined" ? "undefined" : _typeof(oldTree), 'object', 'nanomorph: oldTree should be an object');
      assert.equal(typeof newTree === "undefined" ? "undefined" : _typeof(newTree), 'object', 'nanomorph: newTree should be an object');
      var tree = walk(newTree, oldTree);
      // if (DEBUG) console.log('=> morphed\n  %s', tree.outerHTML)
      return tree;
    }

    // Walk and morph a dom tree
    function walk(newNode, oldNode) {
      // if (DEBUG) {
      //   console.log(
      //   'walk\nold\n  %s\nnew\n  %s',
      //   oldNode && oldNode.outerHTML,
      //   newNode && newNode.outerHTML
      // )
      // }
      if (!oldNode) {
        return newNode;
      } else if (!newNode) {
        return null;
      } else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
        return oldNode;
      } else if (newNode.tagName !== oldNode.tagName) {
        return newNode;
      } else {
        morph(newNode, oldNode);
        updateChildren(newNode, oldNode);
        return oldNode;
      }
    }

    // Update the children of elements
    // (obj, obj) -> null
    function updateChildren(newNode, oldNode) {
      // if (DEBUG) {
      //   console.log(
      //   'updateChildren\nold\n  %s\nnew\n  %s',
      //   oldNode && oldNode.outerHTML,
      //   newNode && newNode.outerHTML
      // )
      // }
      var oldChild, newChild, morphed, oldMatch;

      // The offset is only ever increased, and used for [i - offset] in the loop
      var offset = 0;

      for (var i = 0;; i++) {
        oldChild = oldNode.childNodes[i];
        newChild = newNode.childNodes[i - offset];
        // if (DEBUG) {
        //   console.log(
        //   '===\n- old\n  %s\n- new\n  %s',
        //   oldChild && oldChild.outerHTML,
        //   newChild && newChild.outerHTML
        // )
        // }
        // Both nodes are empty, do nothing
        if (!oldChild && !newChild) {
          break;

          // There is no new child, remove old
        } else if (!newChild) {
          oldNode.removeChild(oldChild);
          i--;

          // There is no old child, add new
        } else if (!oldChild) {
          oldNode.appendChild(newChild);
          offset++;

          // Both nodes are the same, morph
        } else if (same(newChild, oldChild)) {
          morphed = walk(newChild, oldChild);
          if (morphed !== oldChild) {
            oldNode.replaceChild(morphed, oldChild);
            offset++;
          }

          // Both nodes do not share an ID or a placeholder, try reorder
        } else {
          oldMatch = null;

          // Try and find a similar node somewhere in the tree
          for (var j = i; j < oldNode.childNodes.length; j++) {
            if (same(oldNode.childNodes[j], newChild)) {
              oldMatch = oldNode.childNodes[j];
              break;
            }
          }

          // If there was a node with the same ID or placeholder in the old list
          if (oldMatch) {
            morphed = walk(newChild, oldMatch);
            if (morphed !== oldMatch) offset++;
            oldNode.insertBefore(morphed, oldChild);

            // It's safe to morph two nodes in-place if neither has an ID
          } else if (!newChild.id && !oldChild.id) {
            morphed = walk(newChild, oldChild);
            if (morphed !== oldChild) {
              oldNode.replaceChild(morphed, oldChild);
              offset++;
            }

            // Insert the node at the index if we couldn't morph or find a matching node
          } else {
            oldNode.insertBefore(newChild, oldChild);
            offset++;
          }
        }
      }
    }

    function same(a, b) {
      if (a.id) return a.id === b.id;
      if (a.isSameNode) return a.isSameNode(b);
      if (a.tagName !== b.tagName) return false;
      if (a.type === TEXT_NODE) return a.nodeValue === b.nodeValue;
      return false;
    }
  }, { "./lib/morph": 11, "assert": 8 }], 10: [function (require, module, exports) {
    module.exports = [
    // attribute events (can be set with attributes)
    'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave', 'ontouchcancel', 'ontouchend', 'ontouchmove', 'ontouchstart', 'ondragstart', 'ondrag', 'ondragenter', 'ondragleave', 'ondragover', 'ondrop', 'ondragend', 'onkeydown', 'onkeypress', 'onkeyup', 'onunload', 'onabort', 'onerror', 'onresize', 'onscroll', 'onselect', 'onchange', 'onsubmit', 'onreset', 'onfocus', 'onblur', 'oninput',
    // other common events
    'oncontextmenu', 'onfocusin', 'onfocusout'];
  }, {}], 11: [function (require, module, exports) {
    var events = require('./events');
    var eventsLength = events.length;

    var ELEMENT_NODE = 1;
    var TEXT_NODE = 3;
    var COMMENT_NODE = 8;

    module.exports = morph;

    // diff elements and apply the resulting patch to the old node
    // (obj, obj) -> null
    function morph(newNode, oldNode) {
      var nodeType = newNode.nodeType;
      var nodeName = newNode.nodeName;

      if (nodeType === ELEMENT_NODE) {
        copyAttrs(newNode, oldNode);
      }

      if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
      }

      // Some DOM nodes are weird
      // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
      if (nodeName === 'INPUT') updateInput(newNode, oldNode);else if (nodeName === 'OPTION') updateOption(newNode, oldNode);else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode);

      copyEvents(newNode, oldNode);
    }

    function copyAttrs(newNode, oldNode) {
      var oldAttrs = oldNode.attributes;
      var newAttrs = newNode.attributes;
      var attrNamespaceURI = null;
      var attrValue = null;
      var fromValue = null;
      var attrName = null;
      var attr = null;

      for (var i = newAttrs.length - 1; i >= 0; --i) {
        attr = newAttrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;
        if (attrNamespaceURI) {
          attrName = attr.localName || attrName;
          fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName);
          if (fromValue !== attrValue) {
            oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
          }
        } else {
          if (!oldNode.hasAttribute(attrName)) {
            oldNode.setAttribute(attrName, attrValue);
          } else {
            fromValue = oldNode.getAttribute(attrName);
            if (fromValue !== attrValue) {
              // apparently values are always cast to strings, ah well
              if (attrValue === 'null' || attrValue === 'undefined') {
                oldNode.removeAttribute(attrName);
              } else {
                oldNode.setAttribute(attrName, attrValue);
              }
            }
          }
        }
      }

      // Remove any extra attributes found on the original DOM element that
      // weren't found on the target element.
      for (var j = oldAttrs.length - 1; j >= 0; --j) {
        attr = oldAttrs[j];
        if (attr.specified !== false) {
          attrName = attr.name;
          attrNamespaceURI = attr.namespaceURI;

          if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
              oldNode.removeAttributeNS(attrNamespaceURI, attrName);
            }
          } else {
            if (!newNode.hasAttributeNS(null, attrName)) {
              oldNode.removeAttribute(attrName);
            }
          }
        }
      }
    }

    function copyEvents(newNode, oldNode) {
      for (var i = 0; i < eventsLength; i++) {
        var ev = events[i];
        if (newNode[ev]) {
          // if new element has a whitelisted attribute
          oldNode[ev] = newNode[ev]; // update existing element
        } else if (oldNode[ev]) {
          // if existing element has it and new one doesnt
          oldNode[ev] = undefined; // remove it from existing element
        }
      }
    }

    function updateOption(newNode, oldNode) {
      updateAttribute(newNode, oldNode, 'selected');
    }

    // The "value" attribute is special for the <input> element since it sets the
    // initial value. Changing the "value" attribute without changing the "value"
    // property will have no effect since it is only used to the set the initial
    // value. Similar for the "checked" attribute, and "disabled".
    function updateInput(newNode, oldNode) {
      var newValue = newNode.value;
      var oldValue = oldNode.value;

      updateAttribute(newNode, oldNode, 'checked');
      updateAttribute(newNode, oldNode, 'disabled');

      if (newValue !== oldValue) {
        oldNode.setAttribute('value', newValue);
        oldNode.value = newValue;
      }

      if (newValue === 'null') {
        oldNode.value = '';
        oldNode.removeAttribute('value');
      }

      if (!newNode.hasAttributeNS(null, 'value')) {
        oldNode.removeAttribute('value');
      } else if (oldNode.type === 'range') {
        // this is so elements like slider move their UI thingy
        oldNode.value = newValue;
      }
    }

    function updateTextarea(newNode, oldNode) {
      var newValue = newNode.value;
      if (newValue !== oldNode.value) {
        oldNode.value = newValue;
      }

      if (oldNode.firstChild && oldNode.firstChild.nodeValue !== newValue) {
        // Needed for IE. Apparently IE sets the placeholder as the
        // node value and vise versa. This ignores an empty update.
        if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
          return;
        }

        oldNode.firstChild.nodeValue = newValue;
      }
    }

    function updateAttribute(newNode, oldNode, name) {
      if (newNode[name] !== oldNode[name]) {
        oldNode[name] = newNode[name];
        if (newNode[name]) {
          oldNode.setAttribute(name, '');
        } else {
          oldNode.removeAttribute(name);
        }
      }
    }
  }, { "./events": 10 }], 12: [function (require, module, exports) {
    /* global MutationObserver */
    var document = require('global/document');
    var window = require('global/window');
    var assert = require('assert');
    var watch = Object.create(null);
    var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36);
    var KEY_ATTR = 'data-' + KEY_ID;
    var INDEX = 0;

    if (window && window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
        if (Object.keys(watch).length < 1) return;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === KEY_ATTR) {
            eachAttr(mutations[i], turnon, turnoff);
            continue;
          }
          eachMutation(mutations[i].removedNodes, function (index, el) {
            if (!document.documentElement.contains(el)) turnoff(index, el);
          });
          eachMutation(mutations[i].addedNodes, turnon);
        }
      });
      if (document.body) {
        beginObserve(observer);
      } else {
        document.addEventListener('DOMContentLoaded', function (event) {
          beginObserve(observer);
        });
      }
    }

    function beginObserve(observer) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: [KEY_ATTR]
      });
    }

    module.exports = function onload(el, on, off, caller) {
      assert(document.body, 'on-load: will not work prior to DOMContentLoaded');
      on = on || function () {};
      off = off || function () {};
      el.setAttribute(KEY_ATTR, 'o' + INDEX);
      watch['o' + INDEX] = [on, off, 0, caller || onload.caller];
      INDEX += 1;
      return el;
    };

    module.exports.KEY_ATTR = KEY_ATTR;
    module.exports.KEY_ID = KEY_ID;

    function turnon(index, el) {
      if (watch[index][0] && watch[index][2] === 0) {
        watch[index][0](el);
        watch[index][2] = 1;
      }
    }

    function turnoff(index, el) {
      if (watch[index][1] && watch[index][2] === 1) {
        watch[index][1](el);
        watch[index][2] = 0;
      }
    }

    function eachAttr(mutation, on, off) {
      var newValue = mutation.target.getAttribute(KEY_ATTR);
      if (sameOrigin(mutation.oldValue, newValue)) {
        watch[newValue] = watch[mutation.oldValue];
        return;
      }
      if (watch[mutation.oldValue]) {
        off(mutation.oldValue, mutation.target);
      }
      if (watch[newValue]) {
        on(newValue, mutation.target);
      }
    }

    function sameOrigin(oldValue, newValue) {
      if (!oldValue || !newValue) return false;
      return watch[oldValue][3] === watch[newValue][3];
    }

    function eachMutation(nodes, fn) {
      var keys = Object.keys(watch);
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
          var onloadid = nodes[i].getAttribute(KEY_ATTR);
          keys.forEach(function (k) {
            if (onloadid === k) {
              fn(k, nodes[i]);
            }
          });
        }
        if (nodes[i].childNodes.length > 0) {
          eachMutation(nodes[i].childNodes, fn);
        }
      }
    }
  }, { "assert": 8, "global/document": 6, "global/window": 7 }], 13: [function (require, module, exports) {
    module.exports = function yoyoifyAppendChild(el, childs) {
      for (var i = 0; i < childs.length; i++) {
        var node = childs[i];
        if (Array.isArray(node)) {
          yoyoifyAppendChild(el, node);
          continue;
        }
        if (typeof node === 'number' || typeof node === 'boolean' || node instanceof Date || node instanceof RegExp) {
          node = node.toString();
        }
        if (typeof node === 'string') {
          if (/^[\n\r\s]+$/.test(node)) continue;
          if (el.lastChild && el.lastChild.nodeName === '#text') {
            el.lastChild.nodeValue += node;
            continue;
          }
          node = document.createTextNode(node);
        }
        if (node && node.nodeType) {
          el.appendChild(node);
        }
      }
    };
  }, {}] }, {}, [3]);
