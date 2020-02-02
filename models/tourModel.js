const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
// const User = require('../models/userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, 'Rating must be below 5.0'],
        min: [1, 'Rating must be above 1.0'],
        set: val => Math.round(val) // not 4.66666 but 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on New document creation
                return val < this.price; // 100 < 200
            },
            message: 'Discount price ({VALUE}) should be below regular price'   // the VALUE is val variable located at the function parameter
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false    // permanently hide from the output
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User' // established reference between different data sets in Mongoose
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function () {   // Technically not part of the database
    return this.duration / 7
})

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',    // actually exists in reviewModel
    localField: '_id'
})

/** There are 4 middlewares in mongoose */

// Document middleware: runs before .save() and .create() 
tourSchema.pre('save', function (next) {
    // Note: this point to the current document
    this.slug = slugify(this.name, { lower: true })
    next()
})

// guide embedding
// tourSchema.pre('save',async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

// tourSchema.post('save', function (doc, next) {
//     console.log(doc)
//     next()
// })

// Query middleware
/** We need to define the access control, not only find all but also find one */
// tourSchema.pre('find', function (next) {
//     this.find({ secretTour: { $ne: true } })
//     next()
// })

// tourSchema.pre('findOne', function (next) {
//     this.find({ secretTour: { $ne: true } })
//     next()
// })

// better code, is using regular expression, /^find/ means that find, findOne, findOneAndDelete and so on.
tourSchema.pre(/^find/, function (next) {
    // Note: this point to the current query
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    // console.log(docs)
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    })  // Populate meaning replace the guides id with actual data
    next()
})

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {    // Note: This middleware still in front of the geoNear(which only valid as the first stage)
//     // Note: this point to the current aggregation object
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     console.log(this.pipeline())
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour