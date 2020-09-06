/** This script runs independeently from the express application */
const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')

dotenv.config({ path: './.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('DB connection successful')
})


// Read the json file 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

// import data into database
const importData = async () => {
    try {
        await Tour.create(tours)    // Note: please use the object rather than string
        await User.create(users, { validateBeforeSave: false }) // Becuase the passwordConfirm is required
        await Review.create(reviews)
        process.exit()
    } catch (err) {
        // console.log(err)
    }
}


// Delete all the data rom collections
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        process.exit()
    } catch (err) {
        console.log(err)
    }
}


if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}