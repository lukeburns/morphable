const html = require('bel')
const _ = require('../')

// observable state
const state = _({ clicks: 0, time: Date.now() })

// actions
state.click = () => state.clicks++
state.tick = () => state.time = Date.now()

// views 
const timer = _(state => html`<div>
  Time: ${state.time}
</div>`)

const body = _(state => html`<body onclick=${state.click}>
  ${timer(state)}
  <div>Clicks: ${state.clicks}</div>
</body>`)

// render and mount body
body(state, document.body)
setInterval(state.tick, 1)