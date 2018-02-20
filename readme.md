# morphable

composable, reactive dom elements.

```js
npm install morphable
```

## api

```js
let morphable = require('morphable')
```

when passed an object, morphable returns an observable copy of that object using [observer-util](https://github.com/nx-js/observer-util).

otherwise, morphable takes a pure view, i.e. a function that takes state and returns a dom element, and returns a reactive view, a function that takes an observable state and returns a reactive dom element, that mutates itself on the relevant observable state changes using  [nanomorph](https://github.com/choojs/nanomorph).

```js
let observable_state = morphable({})
let reactive_view = morphable(state => dom_element)
let reactive_element = reactive_view(observable_state, [mount_point])
```

when morphables are composed (see example below), only the relevant views are mutated.

## example

In the example below, the child view `timer` updates independently every millisecond, while the parent view `body` only re-renders on click events.

```js
const html = require('bel')
const _ = require('morphable')

// observable state
const state = _({ clicks: 0, time: Date.now() })

// actions
state.click = () => state.clicks++
state.tick = () => state.time = Date.now()

// views 
const timer = _(state => html`<div>
  Time: ${state.time}
</div>`)

const body = _(state => html`<body onclick=${state.click}>
  ${timer(state)}
  <div>Clicks: ${state.clicks}</div>
</body>`)

// render and mount body
body(state, document.body)
setInterval(state.tick, 1)
```
