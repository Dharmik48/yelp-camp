const express = require('express')
const router = express.Router({ mergeParams: true })
const { reviewSchema } = require('../joiSchema')
const Review = require('../models/review')
const Campground = require('../models/campground')
const ExpressError = require('../utilities/ExpressError')
const catchAsync = require('../utilities/catchAsync')

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)

	if (error) {
		const errMsg = error.details.map(e => e.message).join(',')
		throw new ExpressError(400, errMsg)
	}
	next()
}

// REVIEWS routes
router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params
		const { rating, body } = req.body.review
		const campground = await Campground.findById(id)
		const review = new Review({ rating, body })
		campground.reviews.push(review)

		await review.save()
		await campground.save()

		req.flash('success', 'Review successfully added!')
		res.redirect(`/campgrounds/${id}`)
	})
)

router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params
		await Review.findByIdAndDelete(reviewId)
		await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
		res.redirect(`/campgrounds/${id}`)
	})
)

module.exports = router
