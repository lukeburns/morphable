const html = require('bel')
const _ = require('../')

const list = _([])

const body = _(list => html`<body>
  <button onclick=${() => list.push(Math.random())}>Append random number</button>
  <ul>
    ${list.map(num => html`<li>${num}</li>`)}
  </ul>
</body>`)

body(list, document.body)

body.onload = (el, list) => console.log('loaded body', el, list)
body.onunload = (el, list) => console.log('unloaded body', el, list)
