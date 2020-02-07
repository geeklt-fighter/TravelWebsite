const express = require('express')

const router = express.Router()
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan, getToursWithin,getDistances }
    = require('../controllers/tourController')
const { protect, restrictTo } = require('../controllers/authController')
const authController = require('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')
// const { createReview } = require('../controllers/reviewController')

// POST /tour/234fad4/reviews   ->  Nested Route
// GET /tour/234fad4/reviews   ->  Nested Route

// Because below handler is similarly same as reviewRoute
// router.route('/:tourId/reviews')
//     .post(protect, restrictTo('user'), createReview)
// Therefore, we need to change like this, mounting reviewRoute
router.use('/:tourId/reviews', reviewRouter)


// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack

// This way is better

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours)

router
    .route('/tour-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(
        protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan)
 
router
    .route('/tours-distance/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)

router
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances)

router
    .route('/')
    .get(getAllTours)
    .post(
        protect,
        authController.restrictTo('admin', 'lead-guide'),
        createTour)

router
    .route('/:id')
    .get(getTour)
    .patch(
        protect,
        authController.restrictTo('admin', 'lead-guide'),
        updateTour)
    .delete(
        protect,
        authController.restrictTo('admin', 'lead-guide'),
        deleteTour)


module.exports = router
