const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const Factory = require('../controllers/handlerFactory')

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter
    if (req.params.tourId) filter = {tour: req.params.tourId}
    
    const review = await Review.find(filter)

    res.status(200).json({
        status: 'success',
        result: review.length,
        data: {
            review
        }
    })
})


exports.createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id

    const newReview = await Review.create(req.body)

    res.status(200).json({
        status: 'success',
        data: {
            review: newReview
        }
    })
})


exports.deleteReview = Factory.deleteOne(Review)