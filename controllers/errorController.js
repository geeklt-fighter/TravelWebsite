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

const handleJWTError = err => new AppError('Invalid token. Please login again', 401)    // implicitly return

const handleJWTExpiredError = err => new AppError('Your token has been expired! Please login again', 401)    // implicitly return

/*********************************************************************************************************** */

const sentErrorDev = (err, req, res) => {
    // For API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // For Renderer website
    // console.log('Error:', err)
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong !',
        msg: err.message
    })


}

const sentErrorProd = (err, req, res) => {
    // 1 For API
    if (req.originalUrl.startsWith('/api')) {
        // 1.a Operantional Error: send message to the client
        if (err.isOperational) {
            // console.log(err)
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        // 1.b Programming Error or unknown Error: don't leak error details
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
    // 2 For Renderer website
    if (err.isOperational) {
        // 2.a Operantional, trusted error: send message to the client
        // console.log('hello',err)
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong !',
            msg: err.message
        })
    }
    // 2.b Programming or other unknown error: do not leak error details
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong !',
        msg: 'Please try again later'
    })
}

/*********************************************************************************************************** */

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sentErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }  // This point is very tricky: because it does not copy the message
        error.message = err.message

        // handle invalid database id, means: user find the id which is not existed in database
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        // handle duplicate database field: user submit the tour name which is duplicated
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        // handle mongoose validation error
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        // handle json web token error
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)

        sentErrorProd(error, req, res)
    }

}