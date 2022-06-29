const BAR = '█'

module.exports = perf

/* global PerformanceObserver */

function perf () {
  const stats = {}

  window.choo.perf = {}

  // Print all events
  const all = new Perf(stats, 'all')
  Object.defineProperty(window.choo.perf, 'all', {
    get: all.get.bind(all),
    set: noop
  })

  // Print only Choo core events
  const core = new Perf(stats, 'core', function (name) {
    return /^choo/.test(name)
  })
  Object.defineProperty(window.choo.perf, 'core', {
    get: core.get.bind(core),
    set: noop
  })

  // Print component data
  const components = new Perf(stats, 'components', function (name) {
    return !/^choo/.test(name) && !/^bankai/.test(name)
  })
  Object.defineProperty(window.choo.perf, 'components', {
    get: components.get.bind(components),
    set: noop
  })

  // Print choo userland events (event emitter)
  const events = new Perf(stats, 'events', function (name) {
    return /^choo\.emit/.test(name)
  }, function (name) {
    return name.replace(/^choo\.emit\('/, '').replace(/'\)$/, '')
  })
  Object.defineProperty(window.choo.perf, 'events', {
    get: events.get.bind(events),
    set: noop
  })

  const po = new PerformanceObserver(list => list.getEntries().forEach(onEntry));
  po.observe({ type: 'measure' });

  function onEntry({ name, duration }) {
    name = name.replace(/ .*$/, '')

    if (!stats[name]) {
      stats[name] = {
        name,
        count: 0,
        entries: []
      }
    }

    const stat = stats[name]
    stat.count += 1
    stat.entries.push(duration)
  }
}

// Create a new Perf instance by passing it a filter
function Perf (stats, name, filter, rename) {
  this.stats = stats
  this.name = name
  this.filter = filter || function () { return true }
  this.rename = rename || function (name) { return name }
}

// Compute a table of performance entries based on a filter
Perf.prototype.get = function () {
  const filtered = Object.keys(this.stats).filter(this.filter)
  const self = this

  let maxTime = 0
  let maxMedian = 0
  const fmt = filtered.map(function (key) {
    const stat = self.stats[key]
    const totalTime = Number(stat.entries.reduce(function (time, entry) {
      return time + entry
    }, 0).toFixed(2))
    if (totalTime > maxTime) maxTime = totalTime

    const median = getMedian(stat.entries)
    if (median > maxMedian) maxMedian = median

    const name = self.rename(stat.name)
    return new PerfEntry(name, totalTime, median, stat.count)
  })

  const barLength = 10
  fmt.forEach(function (entry) {
    const totalTime = entry['Total Time (ms)']
    const median = entry['Median (ms)']
    entry[' '] = createBar(totalTime / maxTime * 100 / barLength)
    entry['  '] = createBar(median / maxMedian * 100 / barLength)
  })

  function createBar (len) {
    let str = ''
    for (let i = 0, max = Math.round(len); i < max; i++) {
      str += BAR
    }
    return str
  }

  const res = fmt.sort(function (a, b) {
    return b['Total Time (ms)'] - a['Total Time (ms)']
  })
  console.table(res)
  return "Showing performance events for '" + this.name + "'"
}

// An entry for the performance timeline.
function PerfEntry (name, totalTime, median, count) {
  this.Name = name
  this['Total Time (ms)'] = totalTime
  this[' '] = 0
  this['Median (ms)'] = median
  this['  '] = 0
  this['Total Count'] = count
}

// Get the median from an array of numbers.
function getMedian (args) {
  if (!args.length) return 0
  const numbers = args.slice(0).sort(function (a, b) { return a - b })
  const middle = Math.floor(numbers.length / 2)
  const isEven = numbers.length % 2 === 0
  const res = isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle]
  return Number(res.toFixed(2))
}

// Do nothing.
function noop () {}
