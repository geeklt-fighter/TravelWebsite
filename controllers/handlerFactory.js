const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


// Using the closure way
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id)

        if (!doc) {
            return next(new AppError('No tour found with that ID', 404)) // we use return because we don't want to move on the next one
        }

        res.status(204).json({
            status: 'success',
            data: null
        })
    })

