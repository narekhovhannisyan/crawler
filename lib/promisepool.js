const Promise = require('bluebird')
let fns = []

for (let i = 0; i < 10; i++) {
  const f = () => Promise.resolve(i).thenReturn(true).catch(err => false)
  fns.push(f)
}

/* interval in milliseconds */
class PromisePool { 
 
  constructor(concurrency, interval) {
    this.running = 0
    this.success = 0
    this.errors = 0
    this.counterPerInterval = []
    this.waitingQueue = []
    this.fns = []
    this.concurrency = concurrency
    this.interval = interval
  }

  process() {
    if (this.running > this.concurrency) return
    if (this.waitingQueue.length == 0) return 
    let f = this.waitingQueue.shift()
    let currentInterval = dateByInterval()
    this.addRunning(currentInterval)
    f().then(res => {
      if (res) {
        this.finishedSuccessfully()
      } else {
        this.finishedWithError()
      }
      this.removeRunning(currentInterval)
      this.process()
    })
    this.process()
  }

  dateByInterval() {
    return Date.now() - Date.now() % this.interval
  }

  addRunning(_interval) {
    this.counterPerInterval[_interval]++
  }

  removeRunning(_interval) {
    this.counterPerInterval[_interval]--
    if (this.counterPerInterval[_interval] < this.dateByInterval() && this.counterPerInterval[_interval] == 0) {
      this.counterPerInterval.shift()
    }
  }

  finishedSuccessfully() {
    this.success++
  }

  finishedWithError() {
    this.errors++
  }

  addToQueue(_func) {
    if (typeof _func === 'function') {
      return this.waitingQueue.push(_func)
    } else if (Object.prototype.toString.call(_func) === '[object Array]') {
      return _func.map(addToQueue)
    } else {
      throw 'Please give me normal argument :('
    }
    this.process()
  }

  convertToFunction (_promise) {
    for (let i = 0; i < 10; i++) {
      const f = () => Promise.resolve(i).thenReturn(true).catch(err => false)
      return this.fns.push(f)
  }
}



module.exports = {
  PromisePool
}