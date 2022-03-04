const express = require('express')
const router = express.Router()
const ExpressError = require('../utilities/ExpressError')
const catchAsync = require('../utilities/catchAsync')
const { campgroundSchema } = require('../joiSchema')
const Campground = require('../models/campground')

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)

	if (error) {
		const errorMsg = error.details.map(e => e.message).join(', ')
		throw new ExpressError(400, errorMsg)
	}
	next()
}

// INDEX
router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({})

		res.render('campgrounds/index', { campgrounds })
	})
)

// Create
router.get('/new', (req, res) => {
	res.render('campgrounds/new')
})

router.post(
	'/',
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground)
		// 	throw new ExpressError(400, 'Campground data not valid')
		const campground = await new Campground({ ...req.body.campground })
		await campground.save()
		req.flash('success', 'Campground Successfully Created')
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

// Read
router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate(
			'reviews'
		)
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
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Campground.findByIdAndDelete(id)
		req.flash('success', 'Campground Successfully Deleted!')
		res.redirect('/campgrounds')
	})
)

module.exports = router
