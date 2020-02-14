# morphable

composable, reactive dom elements with sparse rendering

```js
npm install morphable
```

powered by [observer-util](https://github.com/nx-js/observer-util), [nanomorph](https://github.com/choojs/nanomorph), and [on-load](https://github.com/shama/on-load). built for use with [bel](https://github.com/shama/bel).

## example

a list of random numbers that are randomized on click.

`ul` reacts to changes to `list` and each `li` reacts to changes to an element of `list`, sparsely. that is, mutating `list[0].number` will only re-render the first list item in the dom.

```js
const html = require('bel')
const _ = require('morphable')

const list = _([ { number: Math.random() } ])

const li = _(item => html`<li onclick=${randomize.bind(item)}>${item.number}</li>`)
const ul = _(list => html`<ul>${list.map(li)}</ul>`)

document.body = html`<body>
  <button onclick=${append.bind(list)}>
    Add a random number
  </button>
  ${ul(list)}
</body>`

function append () {
  this.push({ number: Math.random() })
}

function randomize () {
  this.number = Math.random()
}
```

try running `budo example.js` using [budo](https://github.com/mattdesl/budo) and mutating `window.list` in the console.

## api

```js
let _ = require('morphable')

let state = _({})
let view = _(state => dom_element)
let element = view(state)
```

`element` morphs when `state` that it depends upon changes.

you can subscribe to load, premorph, morph, and unload events on `view`.

```js
view.on('load', () => console.log('loaded element'))
view.on('premorph', () => console.log('element, just before morph'))
view.on('morph', () => console.log('morphed element'))
view.on('unload', () => console.log('unloaded element'))
```

elements start and stop reacting to changes when they are added to and removed from the dom.

## browser support

morphable uses [proxies](https://caniuse.com/#feat=proxy), supported in all modern browsers. proxies are not supported by internet explorer, however there is a [partial polyfill](https://github.com/GoogleChrome/proxy-polyfill).  see [this fork](https://github.com/lukeburns/proxy-polyfill) that makes this library usable in IE11.

using the partial polyfill requires limiting one's use of proxies to features supported by the polyfill. namely, only using only get, set, apply, and construct traps and restricting use to properties defined at proxy creation time. handling arrays is challenging for this reason. the fork patches array mutations, so anticipate performance hits. that said, if you're not doing anything too crazy, you'll probably be fine.
