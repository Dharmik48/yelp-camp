const joi = require('joi')

module.exports = joi.object({
	campground: joi
		.object({
			title: joi.string().required(),
			price: joi.number().min(0).required(),
			image: joi.string().required(),
			description: joi.string().required(),
			location: joi.string().required(),
		})
		.required(),
})
