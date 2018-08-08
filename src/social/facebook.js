const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const rp = require('request-promise')

/**
 * @param uri - Uri to make request.
 * @returns {Promise.<>}
 * @description Makes request to given fb `uri`.
 */
const makeFbRequest = (uri) => {
  const fbUri = uri + '&access_token=' + config.FACEBOOK_APP_ID + '|' + config.FACEBOOK_APP_SECRET
  const options = {
    uri: fbUri,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }

  return rp(options)
}

/**
 * @param postId - The post id.
 * @param fields - Fields to get.
 * @returns {Promise.<>}
 * @description Gets post details by given `postId` and `fields`.
 */
const getPostDetails = (postId, fields) => {
  const fieldsString = fields ? '?fields=' + fields.join(',') : ''
  const url = 'https://graph.facebook.com/v2.9/' + postId + fieldsString

  return makeFbRequest(url)
}

/**
 * @param pageId - The page id.
 * @param limit - Posts count by page.
 * @param fields - Fields to get.
 * @returns {Promise.<>}
 * @description Gets page posts by given `pageId`.
 */
const getPagePosts = (pageId, limit, fields) => {
  const urlazavr = '?fields=posts.limit=(' + limit + ')' + '{' + fields.join(',') + '}'
  const url = 'https://graph.facebook.com/v2.9/' + pageId + urlazavr

  return makeFbRequest(url).then(res => res.posts.data.map(post => Object.assign({}, post, {pageId})))
}

module.exports = {
  getPostDetails,
  getPagePosts
}
