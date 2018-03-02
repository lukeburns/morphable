const html = require('bel')
const _ = require('../')

const state = _([])

const list = _(state => html`<ul>
  ${state.map(num => html`<li>${num}</li>`)}
</ul>`)

const body = _(state => html`<body>
  <button onclick=${() => state.push(Math.random())}>Append random number</button>
  ${list(state)}
</body>`)

body(state, document.body)

list.on('load', () => console.log('loaded list'))
list.on('morph', () => console.log('morphed list'))
list.on('unload', () => console.log('unloaded list'))
