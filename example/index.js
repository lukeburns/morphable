const html = require('bel')
const _ = require('../')

const list = _([])

const body = _(list => html`<body>
  <h1>Random numbers</h1>
  <button onclick=${() => list.push(Math.random())}>Append random number</button>
  <ul>
    ${list.map(num => html`<li>${num}</li>`)}
  </ul>
</body>`)

body.onload = el => console.log('loaded body', el)
body.onunload = el => console.log('unloaded body', el)

body(list, document.body)
