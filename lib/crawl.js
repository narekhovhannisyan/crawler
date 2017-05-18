const models = require('../db')
const Promise = require('bluebird')
const FbPages = require('../lib/fbpages')
const hf = require('../lib/helperfunctions.js')


const runPagesCrawl = () => {
  console.log('starting crawl pages every 20 minutes')
  return hf.callRecursivePromise(() => { return FbPages.startPagesCrawl()}, 1000 * 60) //every minute
}

const runPostsCrawl = () => {
  console.log('starting crawl posts every 20 minutes')
  return hf.callRecursivePromise(() => { return FbPages.startPostsCrawl()}, 1000 * 60) //every minute
}


module.exports = { 
  runPagesCrawl,
  runPostsCrawl
}
 