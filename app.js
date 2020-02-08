const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const cookieParser = require('cookie-parser')

dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
/* Middleware is a function that can modify the incoming request data */
// 1) Global Middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

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
app.use(cookieParser())

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

// This is just test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    console.log(req.cookies)
    next()
})

// Routes

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)

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
