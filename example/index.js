const html = require('bel')
const _ = require('../')

const state = _({ list: [] })

const list = _(state => html`<ul>
  ${state.list.map(num => html`<li>${num}</li>`)}
</ul>`)

const body = _(state => html`<body>
  <button onclick=${() => state.list.push(Math.random())}>Append random number</button>
  ${list(state)}
</body>`)

document.body = body(state)


list.on('load', () => console.log('loaded list'))
list.on('morph', () => console.log('morphed list'))
list.on('unload', () => console.log('unloaded list'))

body.on('load', () => console.log('loaded body'))
body.on('morph', () => console.log('morphed body'))
body.on('unload', () => console.log('unloaded body'))
