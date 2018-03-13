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
let element = view(state)
```

`element` morphs when `state` that it depends upon changes. 

you can subscribe to load, morph, and unload events on `view`.

```js
view.on('load', (state, element) => console.log('loaded element'))
view.on('morph', (state, element) => console.log('morphed element'))
view.on('unload', (state, element) => console.log('unloaded element'))
```

elements start and stop reacting to changes when they are added to and removed from the dom.

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

document.body = body(list)
```

## browser support

this library uses [proxies](https://caniuse.com/#feat=proxy), supported in all modern browsers. proxies are not supported by internet explorer. there is a [partial polyfill](https://github.com/GoogleChrome/proxy-polyfill) with severe limitations.  see [this fork](https://github.com/lukeburns/proxy-polyfill) that makes this library usable in IE11. 

NOTE: to use this partial polyfill requires limiting one's use of proxies to features supported by the polyfill. namely, only using only get, set, apply, and construct traps and restricting use to properties defined at proxy creation time. handling arrays is challenging for this reason. the fork patches array mutations, so anticipate performance hits.

the example included runs in IE11 (just open example/index.html).
