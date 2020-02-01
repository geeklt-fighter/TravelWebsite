const express = require('express')
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserId, getReview } = require('../controllers/reviewController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

// With mergeParams
// POST /tour/dsadsacadsc/reviews
// GET /tour/dsadsacadsc/reviews
// POST /reviews

router.use(protect)

// Both end up in this handler here
router.route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourUserId, createReview)
// Because we only want the user to create the review

router.route('/:id')
    .get(getReview)
    .patch(restrictTo('user', 'admin'), updateReview)
    .delete(restrictTo('user', 'admin'), deleteReview)

module.exports = router