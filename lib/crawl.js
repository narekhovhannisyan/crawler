const models = require('../db')
const Promise = require('bluebird')
const FbPages = require('../lib/fbpages')
const helperFunctions = require('../lib/helperfunctions.js')



const runCrawl = () => {
  console.log('starting crawl pages for new posts!\n')
  return helperFunctions.callRecursivePromise(() => { return FbPages.startFbPagesCrawl()}, 20 * 60) //every 2 hours
}

const crawlFbPages = () => {
    console.log('crawling Facebook!')
    return FbPages.startFbPagesCrawl()
}

module.exports = {
  runCrawl, 
  crawlFbPages
}
 