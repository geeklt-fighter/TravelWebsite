const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', err => {
    // console.log(err.name, err.message)
    // console.log('UNCAUGHT EXCETION! Shutting down ...')
    process.exit(1)
})


const app = require('./app');

dotenv.config({ path: './.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log('DB connection successful')
})


const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    // console.log(`App running on port ${port}`);
})


process.on('unhandleRejection', err => {
    // console.log(err.name, err.message)
    // console.log('UNHANDLED REJECTION! Shutting down ...')
    server.close(() => {
        process.exit(1)
    })
})

