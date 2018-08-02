const html = require('bel')
const _ = require('../')

const list = _([])
const li = _(item => html`<li onclick=${() => item.number = Math.random()}>${item.number}</li>`)
const ul = _(list => html`<ul>${list.map(li)}</ul>`)

document.body = html`<body>
  <button onclick=${() => list.push({ number: Math.random() })}>Add a random number</button>
  ${ul(list)}
</body>`

// events

li.on('load', () => console.log('loaded list item'))
li.on('premorph', () => console.log('premorph list item'))
li.on('morph', () => console.log('morphed list item'))
li.on('unload', () => console.log('unloaded list item'))

ul.on('load', () => console.log('loaded list'))
ul.on('premorph', () => console.log('premorph list'))
ul.on('morph', () => console.log('morphed list'))
ul.on('unload', () => console.log('unloaded list'))
