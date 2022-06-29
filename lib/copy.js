const stateCopy = require('state-copy')
const pluck = require('plucker')

module.exports = copy

function copy (state) {
  const isStateString = state && typeof state === 'string'
  const isChooPath = isStateString && arguments.length === 1 && state.indexOf('state.') === 0

  if (!state || typeof state === 'function') state = window.choo.state
  if (isChooPath) [].push.call(arguments, { state: window.choo.state })

  stateCopy(isStateString ? pluck.apply(this, arguments) : state)
}
