const pretty = require('prettier-bytes')

module.exports = storage

function storage () {
  Object.defineProperty(window.choo, 'storage', {
    get,
    set: noop
  })

  function get () {
    if (navigator.storage) {
      navigator.storage.estimate().then(function (estimate) {
        const value = (estimate.usage / estimate.quota).toFixed()
        clr('Max storage:', fmt(estimate.quota))
        clr('Storage used:', fmt(estimate.usage) + ' (' + value + '%)')
        navigator.storage.persisted().then(function (bool) {
          const val = bool ? 'enabled' : 'disabled'
          clr('Persistent storage:', val)
        })
      })
      return 'Calculating storage quota…'
    } else {
      const protocol = window.location.protocol
      return (/https/.test(protocol))
        ? "The Storage API is unavailable in this browser. We're sorry!"
        : 'The Storage API is unavailable. Serving this site over HTTPS might help enable it!'
    }
  }
}

function clr (msg, arg) {
  const color = '#cc99cc'
  console.log('%c' + msg, 'color: ' + color, arg)
}

function fmt (num) {
  return pretty(num).replace(' ', '')
}

function noop () {}
