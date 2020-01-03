const fs = require('fs')

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


// in the router.params callback
exports.checkID = (req, res, next, value) => {
    console.log(`Tour id is: ${value}`)

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({   // Please notice that we must have "return" here, otherwise it will hit the next function, and send another res to the client
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    next()
}


exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours
        }
    })
}

exports.getTour = (req, res) => {
    // console.log(typeof req.params.id)
    const id = req.params.id * 1    // transfer string to number type

    const tour = tours.find(el => el.id === id)
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
}

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body)

    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })
}

exports.updateTour = (req, res) => {


    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Update tour here'
        }
    })
}

exports.deleteTour = (req, res) => {

    res.status(204).json({
        status: 'success',
        data: null
    })
}