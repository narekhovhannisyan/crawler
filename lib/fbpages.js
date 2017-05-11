const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]

const Promise = require('bluebird')
const models = require('../db')
const Facebook = require('../social/facebook')

const startFbPagesCrawl = () => {
	console.log('startFbPagesCrawl!')
	const time = new Date().getTime()
	const date = new Date(time)
	console.log(date.toString())
	return getFbPageIds().then(crawlFbPages)
}

const crawlFbPages = (pages) => Promise.mapSeries(pages, crawlFbPage)

const crawlFbPage = (page) => getFbPagePosts(page)

const getFbPageIds = () => {
	return models.Pages.findAll({
		attributes: ['page_id'],
		where: {
			active: true
		},
		order: [['updatedAt', 'ASC']]
	}).tap(d => console.log(d.length))
}

const getPostCommentsCount = (postId) => Facebook.getPostDetails(postId, ['comments.summary(true)']).then(res => { return { comments: res.comments.summary.total_count } }).catch(err => {
	console.log(err)
	return { comments: 0 }
})

const getPostReactionsCount = (postId) => Facebook.getPostDetails(postId, ['reactions.summary(true)']).then(res => { return { reactions: res.reactions.summary.total_count } }).catch(err => {
	console.log(err)
	return { reactions: 0 }
})

const getPostSharesCount = (postId) => Facebook.getPostDetails(postId, ['shares']).then(res => {
	return { shares: res.shares ? res.shares.count : 0 }
}).catch(err => {
	console.log(err)
	return { shares: 0 }
})

const grabPostCountsFromFB = (postId) => Promise.all([
	getPostReactionsCount(postId),
	getPostCommentsCount(postId),
	getPostSharesCount(postId)
]).then(results => results.reduce((obj, currentCount) => Object.assign({}, obj, currentCount), { post_id: postId }))

const savePostCounts = (postCounts) => models.Scores.create(postCounts).then(calcGrowthRate)

const calcGrowthRate = (lastPostScore) => {
	const score = lastPostScore.dataValues
	return models.sequelize.query('select * from scores where "createdAt" = (select MAX("createdAt") from scores where "createdAt" < :dateazavr and post_id = :postazavr) and post_id = :postazavr LIMIT 1',
		{ replacements: { postazavr: score.post_id, dateazavr: score.createdAt }, type: models.sequelize.QueryTypes.SELECT })
		.then(result => {
			if (result.length > 0) {
				const res = result[0]
				const postPreviousScore = res.reactions + res.comments + res.shares
				console.log(postPreviousScore)
				const postCurrentScore = lastPostScore.reactions + lastPostScore.comments + lastPostScore.shares
				console.log(postCurrentScore)
				if (postPreviousScore > 0) {
					var percent = ((postCurrentScore - postPreviousScore) * 100 / postPreviousScore)
					if (percent < 0) {
						percent = Math.floor(percent)
					} else {
						percent = Math.round(percent)
					}
				} else {
					var percent = 50
				}
				console.log(percent)
				models.Scores.update({
					growth_rate: percent 
				}, {
					where: {
						score_id: score.score_id 
					}
				})
			}		
			return result
		})
}

const grabAndSavePostCounts = (posts) => Promise.map(posts, post => grabPostCountsFromFB(post.id).then(savePostCounts), {concurrency: 5}).catch(console.error)

const processPosts = (posts) => {
	console.log('Processing Posts', posts[0].id)
	return Promise.map(posts, savePostIntoDbIfNew, { concurrency: 5 }).thenReturn(posts).then(grabAndSavePostCounts).catch(console.error)
}

const getFbPagePosts = (page) => {
	console.log('Getting posts for : ', page.page_id)
	const limit = page.limit || 20
	return Facebook.getPagePosts(page.page_id, limit, ['link', 'created_time', 'message', 'story']).then(processPosts).catch(console.error)
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

// const calcGrowthRate = (postId) => {
// 	return sequelize.query('select * from scores where "createdAt" = ' +	
// 	'(select MAX("createdAt") from scores where "createdAt" < ' + 
// 	'(select MAX("createdAt") from scores where post_id = :postazavr ) and post_id = :postazavr)',
// 	{ replacements: {postazavr: postId} , type: sequelize.QueryTypes.SELECT }).then(result => console.log(result))
// }

module.exports = {
	startFbPagesCrawl
}

// calcGrowthRate('21898300328_10156067730835329')

/* ********* test ********** */
//startFbPagesCrawl()
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
