const models = require('../db')
const Promise = require('bluebird')
const FbPages = require('../lib/fbpages')

const runCrawl = () => {
  console.log('starting crawler')
  return crawlFbPages()
}


const crawlFbPages = () => {
    console.log('Crawling Facebook pages for new info!')
    return FbPages.startFbPagesCrawl()
}
