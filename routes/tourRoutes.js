const express = require('express')

const router = express.Router()
const reviewRouter = require('./reviewRoutes')
const { protect, restrictTo } = require('../controllers/authController')
const { getAllTours, createTour, getTour,
    updateTour, deleteTour, aliasTopTours,
    getTourStats, getMonthlyPlan, getToursWithin,
    getDistances, uploadTourImages, resizeTourImages } = require('../controllers/tourController')


// POST /tour/234fad4/reviews ->  Nested Route
// GET /tour/234fad4/reviews ->  Nested Route
router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours)

router.route('/tour-stats')
    .get(getTourStats)

router.route('/monthly-plan/:year')
    .get(
        protect,
        restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan)

// /tours-distance?distance=223&center=-40,45&unit=mi
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)

router.route('/distances/:latlng/unit/:unit')
    .get(getDistances)


router.route('/')
    .get(protect, getAllTours)
    .post(
        protect,
        restrictTo('admin', 'lead-guide'),
        createTour)

router.route('/:id')
    .get(getTour)
    .patch(
        protect,
        restrictTo('admin', 'lead-guide'),
        uploadTourImages,
        resizeTourImages,
        updateTour)
    .delete(
        protect,
        restrictTo('admin', 'lead-guide'),
        deleteTour)




module.exports = router
