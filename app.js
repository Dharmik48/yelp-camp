const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utilities/ExpressError')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const flash = require('connect-flash')

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
app.use(express.static(path.join(__dirname, '/public')))
const sessionConfig = {
	secret: 'donttellanyone',
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	next()
})

app.get('/', (req, res) => {
	res.redirect('/campgrounds')
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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
