const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();


/* Middleware is a function that can modify the incoming request data */
// 1) Global Middlewares

// Security HTTP headers
app.use(helmet())

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,   // Limit 100 request in an hour
    message: 'Too many requests from this IP, please try again in an hour'
})

app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS script
app.use(xss())

// Prevent Paramater pollution
app.use(hpp({
    whitelist: [    // let the duplicate paramater work
        'duration',  
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

// Serving static files
app.use(express.static(`${__dirname}/public`));

// This is just test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.headers)
    next()
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Should be the last part
// Handle the operational error
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404
    // next(err)   // go straight to line 44

    // Better code
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// Collect all the error handling from the tourController catch(err){.....}
// Error handling middleware
app.use(globalErrorHandler)

module.exports = app;
