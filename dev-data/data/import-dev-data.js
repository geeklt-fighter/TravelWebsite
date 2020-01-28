/** This script runs independeently from the express application */
const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModel')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log(con.connections)
    console.log('DB connection successful')
})


// Read the json file 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))

// import data into database
const importData = async()=>{
    try {
        await Tour.create(tours)    // Note: please use the object rather than string
        console.log('Data successfully loaded !')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}


// Delete all the data rom collections
const deleteData = async()=>{
    try {
        await Tour.deleteMany()
        console.log('Data successfully deleted !')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}


if (process.argv[2]=== '--import') {
    importData()
}else if(process.argv[2]=== '--delete'){
    deleteData()
}
// console.log(process.argv)