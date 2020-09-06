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
const compression = require('compression')

dotenv.config({ path: './.env' });

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')


const app = express();

app.enable('trust proxy')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
/* Middleware is a function that can modify the incoming request data */

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
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

app.use(compression())

app.use((req, res, next) => {
    next()
})

// Routes 
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)
/** Postman API: https://documenter.getpostman.com/view/6532466/TVCfWo5F */

/**
 * Should be the last part 
 * Handle all the url that are not handled before
 * The operational error
 */
app.all('*', (req, res, next) => {
    // Better code
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// Collect all the error handling from the tourController catch(err){.....}
// Error handling middleware
app.use(globalErrorHandler)

module.exports = app;
