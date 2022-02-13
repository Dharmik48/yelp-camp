const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground')

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

// INDEX
app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({})

	res.render('campgrounds/index', { campgrounds })
})

// Create
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
	const campground = await new Campground({ ...req.body.campground })
	campground.save()
	res.redirect('/campgrounds')
})

// Read
app.get('/campgrounds/:id', async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render('campgrounds/show.ejs', { campground })
})

// Update
app.get('/campgrounds/:id/edit', async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render('campgrounds/edit.ejs', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
	const { id } = req.params
	await Campground.findByIdAndUpdate(id, { ...req.body.campground })
	res.redirect(`/campgrounds/${id}`)
})

// DELETE
app.delete('/campgrounds/:id', async (req, res) => {
	const { id } = req.params
	await Campground.findByIdAndDelete(id)
	res.redirect('/campgrounds')
})

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000')
})

// Index		✅
// Create		✅
// Read 		✅
// Update 	✅
// Destroy  ✅