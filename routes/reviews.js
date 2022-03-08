const express = require('express')
const router = express.Router({ mergeParams: true })
const Review = require('../models/review')
const Campground = require('../models/campground')
const catchAsync = require('../utilities/catchAsync')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

// REVIEWS routes
router.post(
	'/',
	isLoggedIn,
	isReviewAuthor,
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params
		const { rating, body } = req.body.review
		const campground = await Campground.findById(id)
		const review = new Review({ rating, body })
		review.author = req.user._id
		campground.reviews.push(review)

		await review.save()
		await campground.save()

		req.flash('success', 'Review successfully added!')
		res.redirect(`/campgrounds/${id}`)
	})
)

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params
		await Review.findByIdAndDelete(reviewId)
		await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
		res.redirect(`/campgrounds/${id}`)
	})
)

module.exports = router
