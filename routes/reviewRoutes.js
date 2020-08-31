const express = require('express')
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserId, getReview } = require('../controllers/reviewController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

// With mergeParams

router.use(protect)

router.route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourUserId, createReview)

router.route('/:id')
    .get(getReview)
    .patch(restrictTo('user', 'admin'), updateReview)
    .delete(restrictTo('user', 'admin'), deleteReview)

module.exports = router