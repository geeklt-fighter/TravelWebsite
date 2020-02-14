const express = require('express')
const { getOverview, getTour, getLoginForm, getAccount, updateUserData } = require('../controllers/viewController')
const { protect, isLoggedIn } = require('../controllers/authController')

const router = express.Router()

// becuase it has the something duplicate with protect
// so we move this part to the unprotect handler
// router.use(isLoggedIn)

router.get('/', isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)

router.get('/submit-user-data', protect, updateUserData)
// router.post('/submit-user-data', protect, updateUserData)
module.exports = router
