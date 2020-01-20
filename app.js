const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();



// console.log(process.env.NODE_ENV)
// 1) Middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware is a function that can modify the incomeing request data
app.use(express.json());
app.use(express.static(`${__dirname}/public`));



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
