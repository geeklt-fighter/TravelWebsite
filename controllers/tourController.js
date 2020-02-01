const Tour = require('../models/tourModel')
// const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
// const AppError = require('../utils/appError')
const Factory = require('../controllers/handlerFactory')
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// in the router.params callback
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,difficulty'
    next()
}



exports.getAllTours = Factory.getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     // Execute the query
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate()
//     const tours = await features.query

//     // Send the response
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     })
// })

exports.getTour = Factory.getOne(Tour, { path: 'reviews' })
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews')
//         // move it to the query middleware
//         // .populate({
//         //     path: 'guides',
//         //     select: '-__v'
//         // })  // Populate meaning replace the guides id with actual data

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404)) // we use return because we don't want to move on the next one
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// })

exports.createTour = Factory.createOne(Tour)
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body)
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     })
//     // try {
//     //     // const newTour = new Tour()
//     //     // newTour.save()


//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }
// })

exports.updateTour = Factory.updateOne(Tour)
// exports.updateTour = catchAsync(async (req, res, next) => {

//     await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true // it will be the validator
//     })
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: 'Update something'
//         }
//     })
// })


exports.deleteTour = Factory.deleteOne(Tour)
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404)) // we use return because we don't want to move on the next one
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// })


// Aggregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // _id: '$ratingsAverage',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: {
                avgPrice: 1 // -1 is descending
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })

})

// Addressing the real business problem
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1    // 2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})