# morphable

composable, reactive dom elements

```js
npm install morphable
```

powered by [observer-util](https://github.com/nx-js/observer-util), [nanomorph](https://github.com/choojs/nanomorph), and [on-load](https://github.com/shama/on-load). built for use with [bel](https://github.com/shama/bel).

## api

```js
let _ = require('morphable')

let state = _({})
let view = _(state => dom_element)
let element = view(state, [mount_point])
```

`element` morphs when `state` that it depends upon changes. 

you can define subscribe to load, morph, and unload events on `view`.

```js
view.on('load', (state, element) => console.log('loaded element'))
view.on('morph', (state, element) => console.log('morphed element'))
view.on('unload', (state, element) => console.log('unloaded element'))
```

reactive elements stop reacting to changes when they are removed from the dom.

## example

```js
const bel = require('bel')
const _ = require('morphable')

const list = _([])

const body = _(list => bel`<body>
  <h1>Random numbers</h1>
  <button onclick=${() => list.push(Math.random())}>Append random number</button>
  <ul>
    ${list.map(num => html`<li>${num}</li>`)}
  </ul>
</body>`)

body(list, document.body)
```
