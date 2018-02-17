const html = require('bel')
const ø = require('../')

let state = ø.observable({ player: 1, time: 0 })

setInterval(() => state.time++, 200)
setInterval(() => state.player++, 1000)

function body (state) {
  return html`<body>
    <h1>Player ${state.player}</h1>
    ${ø(timer)(state)}
  </body>`
}

function timer (state) {
  return html`<div>${state.time}</div>`
}

ø(body, document.body)(state)