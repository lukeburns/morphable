# morphable

composable, reactive dom elements built on [observer-util](https://github.com/nx-js/observer-util) and [nanomorph](https://github.com/choojs/nanomorph).

```js
npm install morphable
```

## api

```js
let morphable = require('morphable')
```

morphable takes a pure view — a function that takes state and returns a dom element — and returns a reactive view — a function that takes an observable state and returns a reactive dom element, that mutates itself on relevant state changes.

```js
let state = morphable.observable({})
let reactive_view = morphable(pure_view)
let reactive_element = reactive_view(state, [initial_element])
```

when morphables are composed (see example), the minimum number of mutations are made.

## example

In the example below, the child view `subview` updates independently when `state.time` changes, and the parent view `view` only re-renders when `state.player` changes.

```js
let ø = require('morphable')
let html = require('bel')

let state = ø.observable({ player: 1, time: 0 })

function view (state) {
  return html`<body>
    <h1>Player ${state.player}</h1>
    ${ø(subview)(state)}
  </body>`
}

function subview (state) {
  return html`<div>${state.time}</div>`
}

ø(view)(state, document.body) // mutate document.body directly
```
