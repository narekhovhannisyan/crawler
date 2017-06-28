/* @flow */
const Promise = require('bluebird')

const callRecursivePromise = (fn: () => Promise<*>, delay: number) => {
  return fn().delay(delay).then(() => callRecursivePromise(fn, delay))
}


module.exports = {
  callRecursivePromise,
}
