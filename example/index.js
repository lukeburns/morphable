const html = require('bel')
const _ = require('../')
_.log = true

// create observable state
const state = _({ player: 1, time: 0 })

// compose reactive views 
const timer = _(state => html`<div>
  ${state.time}
</div>`)

const body = _(state => html`<body onclick=${() => state.player++}>
  <h1>Player ${state.player}</h1>
  ${timer(state)}
</body>`)

// render and mount body
body(state, document.body)

// mutate state
setInterval(() => state.time++, 200)