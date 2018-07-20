const html = require('bel')
const _ = require('../')

const state = _({ items: [] })

for (var i = 0; i < [0,1,2].length; i++) {
  state.items.push({ num: Math.random() })
}

window.state = state

const li = _(item => html`<li>${item.num}</li>`)
const ul = _(state => html`<ul>
  ${state.items.map(li)}
</ul>`)
const body = _(state => html`<body>
  ${ul(state)}
</body>`)

document.body = body(state)


ul.on('load', () => console.log('loaded list'))
ul.on('morph', () => console.log('morphed list'))
ul.on('unload', () => console.log('unloaded list'))

body.on('load', () => console.log('loaded body'))
body.on('morph', () => console.log('morphed body'))
body.on('unload', () => console.log('unloaded body'))
