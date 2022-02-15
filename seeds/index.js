const { default: axios } = require('axios')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
})

const db = mongoose.connection
db.on('error', () => {
	console.error('Cant connect to DB')
})
db.once('open', () => {
	console.log('DB CONNECTED!')
})

const generateName = arr => arr[Math.floor(Math.random() * arr.length)]

const getImage = async () => {
	try {
		const link = await axios.get('https://api.unsplash.com/photos/random', {
			params: {
				client_id: 'YAxLf0FmAFHMjto7DDgJo3wBRQlsOxpETy7BSTHFMiA',
				collections: 483251,
			},
		})
		return link.data.urls.small
	} catch (err) {
		console.error(err)
	}
}

const seedDB = async () => {
	await Campground.deleteMany({})

	for (let i = 0; i < 50; i++) {
		const randomLocation = Math.floor(Math.random() * 1000)
		const price = Math.floor(Math.random() * 30 + 10)
		const image = await getImage()

		const campground = new Campground({
			title: `${generateName(descriptors)} ${generateName(places)}`,
			location: `${cities[randomLocation].city}, ${cities[randomLocation].state}`,
			image,
			description:
				'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores nemo necessitatibus laudantium sint doloribus animi labore itaque amet minus perferendis fugiat incidunt debitis, nam officiis deserunt repellat nostrum perspiciatis reiciendis.',
			price,
		})

		await campground.save()
	}
}

seedDB().then(() => {
	mongoose.connection.close()
})
