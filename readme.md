# morphable

composable, reactive dom elements

```js
npm install morphable
```

powered by [observer-util](https://github.com/nx-js/observer-util), [nanomorph](https://github.com/choojs/nanomorph), and [on-load](https://github.com/shama/on-load). built for use with [bel](https://github.com/shama/bel).

## api

```js
let morphable = require('morphable')

let observable_state = morphable({})
let reactive_view = morphable(state => dom_element)
let reactive_element = reactive_view(observable_state, [mount_point])
```

you can define load and unload handles on a `reactive_view`.

```js
reactive_view.on('load', () => console.log('loaded element'))
reactive_view.on('unload', () => console.log('unloaded element'))
```

reactive elements stop reacting to changes when they are removed from the dom.

## example

```js
const html = require('bel')
const _ = require('morphable')

const list = _([])

const body = _(list => html`<body>
  <h1>Random numbers</h1>
  <button onclick=${() => list.push(Math.random())}>Append random number</button>
  <ul>
    ${list.map(num => html`<li>${num}</li>`)}
  </ul>
</body>`)

body(list, document.body)
```
