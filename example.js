const html = require('bel')
const _ = require('./')
const onload = require('on-load')

// state
const list = _([ { number: Math.random() } ])
window.list = list

// views
const li = _(item => html`<li onclick=${randomize.bind(item)}>${item.number}</li>`)
const ol = _(list => html`<ol><li>total: ${list.reduce((total, li) => total + li.number, 0)}</li> ${list.map(li)}</ol>`)

// actions
function randomize() {
  this.number = Math.random()
}

function append() {
  this.push({ number: Math.random() })
}

// mount
document.body = html`<body>
  <button onclick=${append.bind(list)}>Add a random number</button>
  ${ol(list)}
</body>`

// events
li.on('load', (_, el, item) => {
  console.log('loaded list item')
  setTimeout(function () {
    item.number = Math.random()
  },1000)
})
li.on('morph', () => console.log('morphed list item'))
li.on('unload', () => console.log('unloaded list item'))

ol.on('load', () => console.log('loaded list'))
ol.on('morph', () => console.log('morphed list'))
ol.on('unload', () => console.log('unloaded list'))
