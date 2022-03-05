const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utilities/catchAsync')

router.get('/register', (req, res) => {
	res.render('user/register')
})

router.post(
	'/register',
	catchAsync(async (req, res) => {
		try {
			const { email, username, password } = req.body
			const user = new User({ username, email })
			const registeredUser = await User.register(user, password)
			req.login(registeredUser, err => {
				if (err) return next(err)
				req.flash('success', 'Registration Successful! Welcome to YelpCamp!')
				res.redirect('/campgrounds')
			})
		} catch (err) {
			req.flash('error', err.message)
			res.redirect('/register')
		}
	})
)

router.get('/login', (req, res) => {
	res.render('user/login')
})

router.post(
	'/login',
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
	}),
	(req, res) => {
		req.flash('success', 'Welcome Back!')
		const redirectUrl = req.session.returnTo || '/campgrounds'
		delete req.session.returnTo
		res.redirect(redirectUrl)
	}
)

router.get('/logout', (req, res) => {
	req.logout()
	req.flash('success', 'GoodBye!')
	res.redirect('/campgrounds')
})

module.exports = router
