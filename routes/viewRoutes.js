const express = require('express')
const { getOverview, getTour, getLoginForm } = require('../controllers/viewController')
const { protect, isLoggedIn } = require('../controllers/authController')

const router = express.Router()

router.use(isLoggedIn)

router.get('/', getOverview)
router.get('/tour/:slug', protect, getTour)

// Login
router.get('/login', getLoginForm)
module.exports = router
