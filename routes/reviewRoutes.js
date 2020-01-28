const express = require('express')
const { getAllReviews, createReview } = require('../controllers/reviewController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router({mergeParams: true})

// With mergeParams
// POST /tour/dsadsacadsc/reviews
// GET /tour/dsadsacadsc/reviews
// POST /reviews

// Both end up in this handler here
router.route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'), createReview)
    // Because we only want the user to create the review

module.exports = router