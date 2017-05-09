const Promise = require('bluebird')

const currentScoreDate = (now) => {
  var date = now || new Date()
  return new Date(date.getTime() - (date.getTime() % (60 * 60 * 1000)))
}

const nextCurrentScoreDate = () => {
  var date = new Date()
  var hour = 60 * 60 * 1000
  return new Date(date.getTime() - (date.getTime() % (60 * 60 * 1000)) + hour)
}

const waitFor = (sec) => {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve()
    }, sec * 1000)
  })
}

const callRecursivePromise = (fn, delay) => {
  function recursive () {
    return fn().then(() => waitFor(delay).then(recursive))
  }
  recursive()
}


module.exports = {
  currentScoreDate,
  waitFor,
  callRecursivePromise,
  nextCurrentScoreDate
}
