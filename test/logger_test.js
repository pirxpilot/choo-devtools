const test = require('tape')
const choo = require('@pirxpilot/choo')
const devtools = require('../')

test('Filtering out logs', function (t) {
  t.plan(1)

  const app = choo()
  app.use(devtools({
    filter: function (eventName, data, timing) {
      if (eventName === 'foo') {
        t.pass('Calls filter function')
        return false
      }

      return true
    }
  }))

  app.route('*', function () {
    return 'Need to call `toString*()` for the app to start so need a route.'
  })
  app.toString('/')

  app.emitter.emit('foo')
})
