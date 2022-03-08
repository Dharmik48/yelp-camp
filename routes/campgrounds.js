const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

// INDEX
router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({})

		res.render('campgrounds/index', { campgrounds })
	})
)

// Create
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new')
})

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground)
		// 	throw new ExpressError(400, 'Campground data not valid')
		const campground = await new Campground({ ...req.body.campground })
		campground.author = req.user._id
		await campground.save()
		req.flash('success', 'Campground Successfully Created')
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

// Read
router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({ path: 'reviews', populate: { path: 'author' } })
			.populate('author')
		if (!campground) {
			req.flash('error', 'Campground not found!')
			return res.redirect('/campgrounds')
		}
		res.render('campgrounds/show.ejs', { campground })
	})
)

// Update
router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		if (!campground) {
			req.flash('error', 'Campground not found!')
			return res.redirect('/campgrounds')
		}
		res.render('campgrounds/edit.ejs', { campground })
	})
)

router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Campground.findByIdAndUpdate(id, { ...req.body.campground })
		req.flash('success', 'Campground Successfully Updated!')
		res.redirect(`/campgrounds/${id}`)
	})
)

// DELETE
router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Campground.findByIdAndDelete(id)
		req.flash('success', 'Campground Successfully Deleted!')
		res.redirect('/campgrounds')
	})
)

module.exports = router
