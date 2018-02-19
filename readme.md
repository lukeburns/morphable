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

In the example below, the child view `subview` updates independently when `state.time` changes, and the parent view `view` only re-renders when `state.player` changes.

```js
const html = require('bel')
const _ = require('morphable')

// create observable state
const state = _({ player: 1, time: 0 })

// compose reactive views 
const timer = _(state => html`<div>
  ${state.time}
</div>`)

const body = _(state => html`<body>
  <h1>Player ${state.player}</h1>
  ${timer(state)}
</body>`)

// render and mount body
body(state, document.body)

// mutate state
state.time++ // only timer re-renders
state.player++ // body re-renders
```
