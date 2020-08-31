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

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong !',
        msg: err.message
    })


}

const sentErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // Operantional Error: send message to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        // Programming Error or unknown Error: don't leak error details
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong !',
            msg: err.message
        })
    }
    // Programming or other unknown error: do not leak error details
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

        /**Wrap the operational error with straightfoward message */
        /*************************Operational error*************************/
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
        /*************************Operational error*************************/

        sentErrorProd(error, req, res)
    }

}