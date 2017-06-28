/*       */
const Promise = require('bluebird')

const callRecursivePromise = (fn                  , delay        ) => {
  return fn().delay(delay).then(() => callRecursivePromise(fn, delay))
}


module.exports = {
  callRecursivePromise,
}
