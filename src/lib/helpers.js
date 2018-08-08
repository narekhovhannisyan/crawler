/**
 * @param fn - The function to be called.
 * @param delay - Calling delay.
 * @returns {Promise<T>}
 * @description Calls recursive given `fn` with given `delay`.
 */
const callRecursivePromise = (fn, delay) => {
  return fn().delay(delay).then(() => callRecursivePromise(fn, delay))
}

module.exports = {
  callRecursivePromise,
}
