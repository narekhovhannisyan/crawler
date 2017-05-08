const Promise = require('bluebird')
const models = require('../db')
const Facebook = require('../social/facebook')



const startFbPagesCrawl = () => getFbPageIds().then(crawlFbPages)

const crawlFbPages = (pages) => Promise.map(pages, crawlFbPage)

const crawlFbPage = (page) => getFbPagePosts(page)

const getFbPageIds = () => {
	return models.Pages.findAll({
		attributes: ['page_id'],
		where: {
			active: true
		},
		order: [['updatedAt', 'ASC']]
	})
}

const getPostCommentsCount = (postId) => Facebook.getPostDetails(postId, ['comments.summary(true)']).then(res => { return {comments: res.comments.summary.total_count} }).catch(err => {
	console.log(err)
	return {comments: 0}
})

const getPostReactionsCount = (postId) => Facebook.getPostDetails(postId, ['reactions.summary(true)']).then(res => { return {reactions: res.reactions.summary.total_count} }).catch(err => {
	console.log(err)
	return {reactions: 0}
})

const getPostSharesCount = (postId) => Facebook.getPostDetails(postId, ['shares']).then(res => {
	return {shares: res.shares ? res.shares.count : 0}
}).catch(err => {
	console.log(err)
	return {shares: 0}
})

const grabPostCountsFromFB = (postId) => Promise.all([
	getPostReactionsCount(postId),
	getPostCommentsCount(postId),
	getPostSharesCount(postId)
]).then(results => results.reduce((obj, currentCount) => Object.assign({}, obj, currentCount), {post_id: postId}))

const savePostCounts = (postCounts) => models.Scores.create(postCounts)	

const grabAndSavePostCounts = (posts) => Promise.map(posts, post => { grabPostCountsFromFB(post.id).then(savePostCounts) })

const processPosts = (posts) => {
	return Promise.map(posts, savePostIntoDbIfNew).thenReturn(posts).then(grabAndSavePostCounts)
}

const getFbPagePosts = (page) => {
	const limit = page.limit || 20
	return Facebook.getPagePosts(page.page_id, limit, ['link', 'created_time', 'message', 'story']).then(processPosts)
}

const savePostIntoDbIfNew = (post) => {
	return models.Posts.findOrCreate({
		defaults: {
			post_id: post.id,
			page_id: post.pageId,
			active: true,
			post_message: post.message || post.story,
			post_created_time: post.created_time,
			link: post.link || 'not exists'
		},
		where: {
			post_id: post.id
		}
	})
}


/* ********* test ********** */
startFbPagesCrawl()
// .then(results => {
//   console.log(results)
// })


// const insertPost = (post, pageId) => {
// 	console.log('starting insertion')
// 	return models.Posts.create({
// 		post_id: post.id,
// 		page_id: pageId,
// 		active: true,
// 		post_message: post.message,
// 		post_created_time: post.created_time
// 	}).then(console.log)
// }

// const ifNotExistsInDb = (postId) => models.Posts.findOne({
// 	attributes: ['post_id'],
// 	where: {
// 		post_id: postId
// 	}
// }).then(res => !!res)
