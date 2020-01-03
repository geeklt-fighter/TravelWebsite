const express = require('express')
const router = express.Router()
const { getAllTours, createTour, getTour, updateTour, deleteTour, checkID } = require('../controllers/tourController')

router.param('id', checkID)

// This way is better
router.route('/').get(getAllTours).post(createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)


module.exports = router
