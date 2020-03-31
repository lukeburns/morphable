const html = require('bel')
const _ = require('./')
const onload = require('on-load')

// state
const list = _([ { number: Math.random() } ])
window.list = list

// views
const total = _(list => html`<div id="total">Total: ${list.reduce((total, li) => total + li.number, 0)}</div>`)
const li = _(item => html`<li onclick=${randomize.bind(item)}>${item.number}</li>`)
li.id = "list-item"
const ol = _(list => html`<ol id="ordered-list">${list.map(li)}</ol>`)

// actions
function randomize() {
  this.number = Math.random()
}

function append() {
  this.push({ number: Math.random() })
}

// mount
document.body = html`<body>
  ${total(list)}
  <button onclick=${append.bind(list)}>Add a random number</button>
  ${ol(list)}
</body>`

// events
li.on('load', (_, el, item) => {
  console.log('loaded list item')
  setTimeout(function () {
    item.number = Math.random()
  }, 1000)
})
li.on('morph', () => console.log('morphed list item'))
li.on('unload', () => console.log('unloaded list item'))

ol.on('load', () => console.log('loaded list'))
ol.on('morph', () => console.log('morphed list'))
ol.on('unload', () => console.log('unloaded list'))
