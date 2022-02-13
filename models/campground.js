<<<<<<< HEAD
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campgroundSchema = new Schema({
	title: String,
	price: Number,
	image: String,
	description: String,
	location: String,
})

module.exports = mongoose.model('Campground', campgroundSchema)
=======
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campgroundSchema = new Schema({
	title: String,
	price: Number,
	image: String,
	description: String,
	location: String,
})

module.exports = mongoose.model('Campground', campgroundSchema)
>>>>>>> 07e9a713fe9425e9d54b09bee418c50b3e3ab6b5
