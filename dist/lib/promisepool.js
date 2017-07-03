const Promise = require('bluebird')

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
    let currentInterval = this.dateByInterval()
    this.addRunning(currentInterval)
    f().then(res => {
      console.log('execution!')
      console.log(res)
      if (res) {
        this.finishedSuccessfully()
      } else {
        this.finishedWithError()
      }
      this.removeRunning(currentInterval)
      console.log(this.success)
      this.process()
    })
    this.process()
  }

  dateByInterval() {
    return Date.now() - Date.now() % this.interval
  }

  getInterval() {
    return this.dateByInterval()
  }

  addRunning() {
    this.counterPerInterval[this.getInterval()]++
  }

  removeRunning(_interval) {
    this.counterPerInterval[_interval]--
    if (
      this.counterPerInterval[_interval] < this.dateByInterval() && this.counterPerInterval[_interval] == 0
    ) {
      this.counterPerInterval.shift()
    }
  }

  finishedSuccessfully() {
    this.success++
  }

  finishedWithError() {
    this.errors++
  }

  addToQueue() {
    this.fns.forEach(item => this.waitingQueue.push(item))
    this.process()
    return Promise.resolve()
  }

  convertToFunction(_promise) {
    this.fns.push(() => _promise().thenReturn(true).catch(err => console.log(err, err.stack)))
    return this
  }
}

module.exports = {
  PromisePool
}
