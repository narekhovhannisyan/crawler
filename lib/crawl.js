const models = require('../db')
const Promise = require('bluebird')
const FbPages = require('../lib/fbpages')
const helperFunctions = require('../lib/helperfunctions.js')



const runCrawl = () => {
  console.log('starting crawl pages for new posts!\n')
  return helperFunctions.callRecursivePromise(() => { return FbPages.startFbPagesCrawl()}, 20 * 60) // 20 minutes
}

const runCrawlEvery20Minutes = () => {
  console.log('starting crawl pages every 20 minutes')
  return helperFunctions.callRecursivePromise(() => { return FbPages.startFbPagesCrawl20()}, 60)
}

const crawlFbPages = () => {
    console.log('crawling Facebook!')
    return FbPages.startFbPagesCrawl20()
}

module.exports = {
  runCrawl, 
  crawlFbPages,
  runCrawlEvery20Minutes
}
 