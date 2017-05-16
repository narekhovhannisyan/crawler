const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]

const Promise = require('bluebird')
const models = require('../db')
const Facebook = require('../social/facebook')

const dateNow = () => {
	const time = new Date().getTime()
	const date = new Date(time)
	return date
}

const startFbPagesCrawl = () => {
	console.log('startFbPagesCrawl!')
	console.log(dateNow().toString())
	return getFbPageIds().then(crawlFbPages)
}

const crawlFbPages = (pages) => Promise.mapSeries(pages, page => updateLastCrawlDate(page).then(crawlFbPage))

const crawlFbPage = (page) => getFbPagePosts(page)

const updateLastCrawlDate = (page) => {
	const date = dateNow()
	models.Pages.update({
		updatedAt:date
	},{
		where: {
			page_id: page.page_id
		}
	})
	return page.save()
}

const getFbPageIds = () => {
	return models.Pages.findAll({
		attributes: ['page_id'],
		where : {
			active: true
		},
		order: [['updatedAt', 'ASC']]
	})
}

const getPostCommentsCount = (postId) => Facebook.getPostDetails(postId, ['comments.summary(true)']).then(res => { return { comments: res.comments.summary.total_count } }).catch(err => {
	console.log(err, err.stack)
	return { comments: 0 }
})

const getPostReactionsCount = (postId) => Facebook.getPostDetails(postId, ['reactions.summary(true)']).then(res => { return { reactions: res.reactions.summary.total_count } }).catch(err => {
	console.log(err, err.stack)
	return { reactions: 0 }
})

const getPostSharesCount = (postId) => Facebook.getPostDetails(postId, ['shares']).then(res => {
	return { shares: res.shares ? res.shares.count : 0 }
}).catch(err => {
	console.log(err, err.stack)
	return { shares: 0 }
})

const grabPostCountsFromFB = (postId) => Promise.all([
	getPostReactionsCount(postId),
	getPostCommentsCount(postId),
	getPostSharesCount(postId)
]).then(results => results.reduce((obj, currentCount) => Object.assign({}, obj, currentCount), { post_id: postId }))

const savePostScores = (postScores) => models.Scores.create(postScores)
	.then(setScoreGrowthRate)
	.then(setPostLastGrowthRate)

const updateScoreGR = () => models.Scores.update({growth_rate: percent }, {
	where: { score_id: score.score_id }
})

const getPreLastScore = (score) => models.sequelize.query('select * from scores where "createdAt" = (select MAX("createdAt") from scores where "createdAt" < :dateazavr and post_id = :postazavr) and post_id = :postazavr LIMIT 1',
		{ replacements: { postazavr: score.post_id, dateazavr: score.createdAt }, type: models.sequelize.QueryTypes.SELECT }).then(res => res.length === 1 ? res[0] : null)

const calcGrowthRate = (score) => {
	return getPreLastScore(score).then(res => {
		if (!res) {
			return 0
		}

		console.log('\npost id: ', res.post_id)
		const postPreviousScore = res.reactions + res.comments + res.shares
		console.log('post\'s previous score: ', postPreviousScore)
		const postCurrentScore = score.reactions + score.comments + score.shares
		console.log('post\'s current score: ', postCurrentScore)

		if (postPreviousScore > 0) {
			let percent = ((postCurrentScore - postPreviousScore) * 100 / postPreviousScore)
			return percent < 0 ? Math.floor(percent) : Math.round(percent)
		} else {
			return 50
		}
	})
}

const setScoreGrowthRate = (score) => calcGrowthRate(score).then(percent => {
	score.growth_rate = percent
	return score.save()
})

const setPostLastGrowthRate = (score) => {
	return models.Posts.update({
		last_growth_rate: score.growth_rate,
		last_growth_rate_date: score.createdAt
	},{
		where: {
			post_id: score.post_id
		}
	})
}

const grabAndSavePostScore = (posts) => Promise.map(posts, post => grabPostCountsFromFB(post.id).then(savePostScores), {concurrency: 5})
	.catch(err => console.log(err, err.stack))

const processPosts = (posts) => {
	console.log('Processing Posts', posts[0].id)
	return Promise.map(posts, savePostIntoDbIfNew, { concurrency: 5 }).thenReturn(posts).then(grabAndSavePostScore).catch(err => console.log(err, err.stack))
}

const getFbPagePosts = (page) => {
	console.log('\nGetting posts for : ', page.page_id)
	const limit = page.limit || 20
	return Facebook.getPagePosts(page.page_id, limit, ['link', 'created_time', 'message', 'story']).then(processPosts).catch(err => console.log(err, err.stack))
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

module.exports = {
	startFbPagesCrawl
}
