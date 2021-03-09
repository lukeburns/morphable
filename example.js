const html = require('nanohtml')
const _ = require('./')

const storedGames = JSON.parse(localStorage.getItem('games') || '[]')
const games = _(storedGames)

function init () {
  // state
  const game = _({
    loss: 0,
    timer: 30 * 1000,
    playing: true,
    booms: 3
  })
  const interval = setInterval(() => {
    if (game.timer > 0) {
      game.timer -= 100
    } else {
      game.playing = false
      games.push({ loss: game.loss, booms: game.booms })
      localStorage.setItem('games', JSON.stringify(games))
      clearInterval(interval)
    }
  }, 100)
  const list = _([])
  window.list = list

  document.addEventListener('keydown', function (e) {
    console.log(e.keyCode)
    if (e.keyCode === 32) { // spacebar
      boom()
    }
  })

  // views
  const filtered = () => list.filter(({ deleted }) => !deleted)
  const loss = _(() => html`<div id="loss">
    <p>Minimize your loss!</p> <strong>Loss:</strong> ${game.loss}
  </div>`)
  const timer = _(() => html`<div id="timer">
    <strong>Time Remaining:</strong> ${game.timer / 1000} seconds
  </div>`)
  const booms = _(() => html`<div id="booms">
    <button ontouchstart=${boom} ${game.booms === 0 ? 'disabled' : ''}>BOOM (spacebar)</button> (${game.booms} remaining)
  </div>`)
  const li = _(item => html`<li style="${'margin-bottom: 1px'}">
    <div style="${`
      display: inline-block; 
      width: 100%; 
      text-align: center; 
      background: rgba(255, 0, 0, ${item.count < 3000 ? 1 - item.count / 3000 : 0});
      padding: 5px;
    `}" ontouchstart=${reset.bind(item)}>
      +${item.number}
      <div style="display: inline; float: right;">
        <!-- <button ontouchstart=${randomize.bind(item)}>randomize</button> -->
        <!-- <button ontouchstart=${remove.bind(item)}>delete</button>-->
        in ${Math.ceil(item.count / 1000)} seconds
      </div>
    </div>
  </li>`, { observeListeners: true })
  li.id = 'list-item'
  const ul = _(list => html`<ul style="${`
    margin: 0 auto; 
    width: 35%; 
    list-style: none; 
    padding: 0;
  `}" id="ordered-list">${filtered().map(li)}</ul>`)
  const bestGames = _(() => html`<div style="width: 35%; margin: 2em auto; text-align: center;">
    Best Games
    <ol style="padding: 0;">
      ${games.map(({ loss }) => loss).sort().map(loss => html`<li>Loss: ${loss}</li>`)}
    </ol>
  </div>`)

  // actions
  function randomize () {
    if (game.playing) {
      this.number = randomNumber()
    }
  }

  function reset () {
    if (game.playing) {
      this.count = randomCount()
      this.number = randomNumber()
    }
  }

  function boom () {
    if (game.playing && game.booms > 0) {
      list.map(item => reset.call(item))
      --game.booms
    }
  }

  function remove () {
    if (game.playing) {
      this.deleted = true
    }
  }

  function append ({ number, count }) {
    list.push({ number: number || randomNumber(), count: count || 3000, deleted: false })
  }

  // mount
  document.body = html`<body>
    <!-- <button ontouchstart=${append}>Add a random bit</button> -->
    <div style="text-align: center;">
      <button ontouchstart=${init}>New Game</button>
      ${loss()}
      ${timer()}
      ${booms()}
    </div>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 2em">
    ${ul(list)}
    <hr style="border: none; border-top: 1px solid #ddd; margin: 2em">
    ${bestGames()}
  </body>`

  // 10 random bits
  for (let index = 0; index < 10; index++) {
    append({ count: randomCount() })
  }

  // events
  li.on('load', (el, item) => {
    console.log('load', el)
    const interval = setInterval(function () {
      if (game.playing && !item.deleted) {
        if (item.count > 100) {
          item.count -= 100
        } else {
          game.loss += item.number
          item.number = randomNumber()
          item.count = randomCount()
        }
      } else {
        clearInterval(interval)
        li.removeAllListeners()
      }
    }, 100)
  })
}

document.head.appendChild(html`
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui"/>
`)
init()

// helpers
function randomNumber () {
  return Math.ceil(Math.random() * 1000)
}

function randomCount () {
  return Math.ceil(Math.random() * 7000) + 2000
}
