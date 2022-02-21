const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./joiSchema')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utilities/ExpressError')
const catchAsync = require('./utilities/catchAsync')

const app = express()

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => {
	console.log('CONNECTD TO MONGO')
})

app.engine('ejs', ejsMate) // Tell express to render ejs using 'ejsMate'

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
	res.redirect('/campgrounds')
})

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)

	if (error) {
		const errorMsg = error.details.map(e => e.message).join(', ')
		throw new ExpressError(400, errorMsg)
	}
	next()
}

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)

	if (error) {
		const errMsg = error.details.map(e => e.message).join(',')
		throw new ExpressError(400, errMsg)
	}
	next()
}

// INDEX
app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({})

		res.render('campgrounds/index', { campgrounds })
	})
)

// Create
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new')
})

app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground)
		// 	throw new ExpressError(400, 'Campground data not valid')
		const campground = await new Campground({ ...req.body.campground })
		await campground.save()
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

// Read
app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		res.render('campgrounds/show.ejs', { campground })
	})
)

// Update
app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		res.render('campgrounds/edit.ejs', { campground })
	})
)

app.put(
	'/campgrounds/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Campground.findByIdAndUpdate(id, { ...req.body.campground })
		res.redirect(`/campgrounds/${id}`)
	})
)

// DELETE
app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Campground.findByIdAndDelete(id)
		res.redirect('/campgrounds')
	})
)

// REVIEWS routes
app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	catchAsync(async (req, res) => {
		const { id } = req.params
		const { rating, body } = req.body.review
		const campground = await Campground.findById(id)
		const review = new Review({ rating, body })
		campground.reviews.push(review)

		await review.save()
		await campground.save()

		res.redirect(`/campgrounds/${id}`)
	})
)

app.all('*', (req, res, next) => {
	next(new ExpressError(404, 'Page Not Found!'))
})

// ERROR HANDLER
app.use((err, req, res, next) => {
	const { status = 500 } = err
	if (!err.message) err.message = 'Something went wrong! :('
	res.status(status).render('errorTemplate', { err })
})

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000')
})
