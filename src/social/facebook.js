const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const rp = require('request-promise')
const models = require('../db')


const makeFbRequest = (uri) => {
	uri += '&access_token=' + config.FACEBOOK_APP_ID + '|' + config.FACEBOOK_APP_SECRET
	let options = {
		uri: uri,
		headers: {
				'User-Agent': 'Request-Promise'
		},
		json: true 
	}
	return rp(options)
}

const getPostDetails = (postId, fields) => {
	let fieldeghen = fields ? '?fields=' + fields.join(',') : ''
	let url = 'https://graph.facebook.com/v2.9/' + postId + fieldeghen
	return makeFbRequest(url)
}

const getPagePosts = (pageId, limit, fields) => {
	let urlazavr = '?fields=posts.limit=(' + limit + ')' + '{' + fields.join(',') + '}'
	let url = 'https://graph.facebook.com/v2.9/' + pageId + urlazavr
	return makeFbRequest(url).then(res => {
		return res.posts.data.map(post => Object.assign({}, post, {pageId}))
	})
}


module.exports = {
	getPostDetails,
	getPagePosts
}
