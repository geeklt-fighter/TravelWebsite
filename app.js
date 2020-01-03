const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) Middlewares
app.use(morgan('dev'))
// Middleware is a function that can modify the incomeing request data
app.use(express.json())


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)


module.exports = app
