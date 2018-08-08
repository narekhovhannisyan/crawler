const FbPages = require('../lib/fbpages')
const helpers = require('./helpers.js')

/**
 * @description Starts crawling fb pages.
 */
const runPagesCrawl = () => {
  console.log('Start crawling fb pages.')
  return helpers.callRecursivePromise(() => {
    return FbPages.startPagesCrawl()
  }, 1000 * 60) //every minute
}

/**
 * @description Starts crawling fb posts.
 */
const runPostsCrawl = () => {
  console.log('Start crawling fb posts.')
  return helpers.callRecursivePromise(() => {
    return FbPages.startPostsCrawl()
  }, 1000 * 60) //every minute
}

module.exports = {
  runPagesCrawl,
  runPostsCrawl
}
