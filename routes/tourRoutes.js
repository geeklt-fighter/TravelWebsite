const express = require('express')

const router = express.Router()
const { getAllTours, createTour, getTour, updateTour, deleteTour, checkID, checkBody }
    = require('../controllers/tourController')

router.param('id', checkID)

// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack

// This way is better
router
    .route('/')
    .get(getAllTours)
    .post(checkBody, createTour)
router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)


module.exports = router
