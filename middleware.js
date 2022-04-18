const Campground = require('./models/campground')
const { campgroundSchema, reviewSchema } = require('./joiSchema')
const ExpressError = require('./utilities/ExpressError')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl
		req.flash('error', 'You must be logged in!')
		return res.redirect('/login')
	}
	next()
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You cannot do that')
		return res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)

	if (error) {
		const errorMsg = error.details.map(e => e.message).join(', ')
		throw new ExpressError(400, errorMsg)
	}
	next()
}

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)

	if (error) {
		const errMsg = error.details.map(e => e.message).join(',')
		throw new ExpressError(400, errMsg)
	}
	next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params
	// console.log(reviewId)
	const review = await Review.findById(reviewId)
	if (review && !review.author.equals(req.user._id)) {
		req.flash('error', 'You cannot do that!')
		res.redirect(`/campgrounds/${id}`)
	}
	next()
}