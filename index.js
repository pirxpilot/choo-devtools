const storage = require('./lib/storage')
const logger = require('./lib/logger')
const debug = require('./lib/debug')
const copy = require('./lib/copy')
const help = require('./lib/help')
const perf = require('./lib/perf')
const log = require('./lib/log')
const getAllRoutes = require('@pirxpilot/wayfarer/get-all-routes')
const nanobus = require('@pirxpilot/nanobus')

module.exports = expose

function expose (opts = {}) {
  store.storeName = 'choo-devtools'
  return store
  function store (state, emitter, app) {
    const localEmitter = nanobus()

    if (typeof window !== 'undefined') {
      logger(state, emitter, opts)
    }

    emitter.on('DOMContentLoaded', function () {
      if (typeof window === 'undefined') return
      window.choo = {}

      window.choo.state = state
      window.choo.emit = function () {
        emitter.emit.apply(emitter, arguments)
      }
      window.choo.on = function (eventName, listener) {
        emitter.on(eventName, listener)
      }

      debug(state, emitter, app, localEmitter)

      log(state, emitter, app, localEmitter)
      perf(state, emitter, app, localEmitter)
      window.choo.copy = copy
      if (app.router && app.router.router) {
        window.choo.routes = Object.keys(getAllRoutes(app.router.router))
      }

      storage()
      help()
    })
  }
}
