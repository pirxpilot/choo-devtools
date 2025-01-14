const onChange = require('object-change-callsite')
const nanologger = require('nanologger')
const assert = require('assert')

const enabledMessage = 'Debugging enabled. To disable run: `choo.debug = false`'
const disabledMessage = 'Debugging disabled. We hope it was helpful! 🙌'

module.exports = debug

function debug (state, emitter, app, localEmitter) {
  const log = nanologger('choo-devtools')
  let enabled = window.localStorage.logLevel === 'debug'
  if (enabled) log.info(enabledMessage)

  state = onChange(state, function (attr, value, callsite) {
    if (!enabled) return
    callsite = callsite.split('\n')[1].replace(/^ +/, '')
    log.info('state.' + attr, value, '\n' + callsite)
  })

  app.state = state

  Object.defineProperty(window.choo, 'debug', {
    get: function () {
      window.localStorage.logLevel = 'debug'
      localEmitter.emit('debug', true)
      enabled = true
      return enabledMessage
    },
    set: function (bool) {
      assert.equal(typeof bool, 'boolean', 'choo-devtools.debug: bool should be type boolean')
      window.localStorage.logLevel = bool ? 'debug' : 'info'
      enabled = bool
      localEmitter.emit('debug', enabled)
      if (enabled) log.info(enabledMessage)
      else log.info(disabledMessage)
    }
  })
}
