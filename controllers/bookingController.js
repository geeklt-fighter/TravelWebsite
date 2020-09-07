
const path = require('path')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const Factory = require('../controllers/handlerFactory')
const Booking = require('../models/bookingModel')
const User = require('../models/userModel')


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                amount: tour.price * 100,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                currency: 'usd',
                quantity: 1
            }
        ]
    })
    // Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})


// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     // This is only temporary, because it's unsecure: everyone can make bookings without paying
//     const { tour, user, price } = req.query

//     if (!tour && !user && !price) {
//         return next()
//     }

//     await Booking.create({ tour, user, price })
//     res.redirect(req.originalUrl.split('?')[0])
// })
const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id
    const user = (await User.findOne({ email: session.customer_email })).id
    const price = session.line_items[0].amount / 100
    await Booking.create({ tour, user, price })
}

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature']

    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        return res.status(400).send(`webhook error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object)
    }

    res.status(200).json({
        received: true
    })
}

exports.createBooking = Factory.createOne(Booking)
exports.getBooking = Factory.getOne(Booking)
exports.getAllBooking = Factory.getAll(Booking)
exports.updateBooking = Factory.updateOne(Booking)
exports.deleteBooking = Factory.deleteOne(Booking)
