const rp = require('request-promise')
const models = require('../db')
var env = process.env.NODE_ENV || 'development'
var config = require(__dirname + '/../config/config.json')[env]


const makeFbRequest = (uri) => {
    uri += '&access_token=' + appId + '|' + appSecret 
    var options = {
        uri: uri,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true 
    }
    return rp(options)
}

const getPostDetails = (postId, fields) => {
    var fieldeghen = fields ? '?fields=' + fields.join(',') : ''
    var url = 'https://graph.facebook.com/v2.9/' + postId + fieldeghen
    return makeFbRequest(url)
}

const getPagePosts = (pageId, limit, fields) => {
    var urlazavr = '?fields=posts.limit=(' + limit + ')' + '{' + fields.join(',') + '}'
    var url = 'https://graph.facebook.com/v2.9/' + pageId + urlazavr
    return makeFbRequest(url).then(res => {
        return res.posts.data.map(post => Object.assign({}, post, {pageId}))
    })
}


module.exports = {
    makeFbRequest,
    getPostDetails,
    getPagePosts
}
