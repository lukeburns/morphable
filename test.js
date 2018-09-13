const html = require('bel')
const { observable, observe, unobserve, isObservable } = require('@nx-js/observer-util')
const _ = require('./')
const test = require('tape')

test('objects and arrays are observable', function (t) {
  t.ok(isObservable(_({})), 'object is observable')
  t.ok(isObservable(_([])), 'array is observable')
  t.end()
})

test('views are reactive', function (t) {
  t.plan(2)

  let state = _({ content: 'initial state' })
  let body = _(state => html`<body>${state.content}</body>`)
  body.on('morph', () => t.equal(document.body.innerHTML, 'final state', 'final state ok'))
  document.body = body(state)
  t.equal(document.body.innerHTML, 'initial state', 'initial state ok')
  setTimeout(() => state.content = 'final state', 100)
})

test('views should cache elements with their state', function (t) { // todo: handle caching of views (`this` included)
  t.plan(4)

  let list = _([])
  list.append = () => list.push({ number: Math.random() })

  let li = _(item => html`<li onclick=${() => item.number = Math.random()}>${item.number}</li>`)
  let ul = _(list => html`<ul>${list.map(li)}</ul>`)

  document.body = html`<body>
    <button onclick=${list.append}>Add a random number</button>
    ${ul(list)}
  </body>`

  let j = 0
  li.on('morph', () => {
    if (++j == 2) {
      t.equal(document.body.getElementsByTagName('li')[0].innerHTML, '0', 'li DOM element #1 bound to list[0]')
      t.equal(document.body.getElementsByTagName('li')[1].innerHTML, '1', 'li DOM element #2 bound to list[1]')
      t.equal(i, 2, 'child li states morphed independently of parent view ul')
    }
  })

  let i = 0
  ul.on('morph', () => {
    if (++i == 2) {
      t.equal(document.body.getElementsByTagName('li').length, 2, 'should be two list items')

      setTimeout(() => {
        list[0].number = 0
        setTimeout(() => list[1].number = 1, 100)
      }, 100)
    }
  })

  setTimeout(() => {
    list.append()
    setTimeout(() => list.append(), 100) // race condition? — implement async reaction scheduling? https://github.com/nx-js/observer-util. i'm not experiencing this in chrome devtools (I can batch list.append() without any trouble, so I'm not 100% what's happening here in electron behind the scenes)
  }, 100)
})

test('composed views should morph sparsely', function (t) {
  t.plan(2)

  let ulmorphs = 0
  let limorphs = 0

  let list = _([ { number: 0 } ])
  list.append = () => list.push({ number: Math.random() })

  let li = _(item => html`<li onclick=${() => item.number = Math.random()}>${item.number}</li>`)
  let ul = _(list => html`<ul>${list.map(li)}</ul>`)

  document.body = html`<body>
    <button onclick=${list.append}>Add a random number</button>
    ${ul(list)}
  </body>`

  ul.on('morph', () => {
    ulmorphs++
    t.equal(ulmorphs, 1, 'ul does not morph on list item mutation')
    t.equal(limorphs, 1, 'list item does not morph when sibling is appended')
  })

  li.on('morph', () => {
    limorphs++
    list.append() // (2) then morph list
    t.end()
  })

  setTimeout(() => list[0].number = 1, 100) // (1) morph first item
})

//   reactive views should work with any templating library
//
// element = view.call(...observables) should be a dom element
//
//   dom elements should be wrapped with an event emitter and fire load, unload, premorph, and morph events as expected
