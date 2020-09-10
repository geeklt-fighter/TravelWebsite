const express = require('express')
const { getOverview, getTour, getMyTours, getLoginForm, getAccount, updateUserData, getSignupForm, getHome } = require('../controllers/viewController')
const { protect, isLoggedIn, logout } = require('../controllers/authController')
const { createBookingCheckout } = require('../controllers/bookingController')

const router = express.Router()

// becuase it has the something duplicate with protect
// so we move this part to the unprotect handler
// router.use(isLoggedIn)

router.get('/overview', isLoggedIn, getOverview)
router.get('/', isLoggedIn, getHome)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/signup', getSignupForm)
router.get('/me', protect, getAccount)
router.get('/my-tours',
    // createBookingCheckout,
    protect,
    getMyTours)

router.get('/submit-user-data', protect, updateUserData)
// router.post('/submit-user-data', protect, updateUserData)
module.exports = router
