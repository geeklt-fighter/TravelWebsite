const AppError = require('../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. Please use another value`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const sentErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sentErrorProd = (err, res) => {
    // Operantional Error: send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })

        // Programming Error or unknown Error: don't leak error details
    } else {
        // 1) Log error
        console.error('Error: ', err)

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sentErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }

        // handle invalid database id, means: user find the id which is not existed in database
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        // handle duplicate database field: user submit the tour name which is duplicated
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        // handle mongoose validation error
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)

        sentErrorProd(error, res)
    }

}