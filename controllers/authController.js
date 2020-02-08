const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = id => {
    return jwt.sign({ id: id }
        , process.env.JWT_SECRET
        , { expiresIn: process.env.JWT_EXPIRES_IN })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure: true,   // using HTTPS, so we only use in production
        httpOnly: true  // prevent XSS attack

    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true
    }
    res.cookie('jwt', token, cookieOptions)

    // Remove the password from the output
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 100 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)

    createSendToken(newUser, 201, res)

    /** The comment lines are refactored to line 30 */
    // const token = signToken(newUser._id)
    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body


    // 1) check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    // 2) check if user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password')
    // console.log(user)
    const correct = await user.correctPassword(password, user.password)

    if (!user || !correct) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everthing ok, send token to client
    createSendToken(user, 200, res)
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
})


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    // console.log(token)
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access!', 401))
    }
    // 2) Verfication token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded)    // Example: { id: '5e2947c92d13083fe0d7dead', iat: 1579770175, exp: 1579770225 }

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id)
    if (!freshUser) {
        return next(new AppError('The token belonging to this user does no longer exists', 401))
    }


    // 4) Check if user change password after the JWT was issued
    if (freshUser.changesPasswordAfter(decoded.iat)) {
        return next(new AppError('User Recently changed Password! Please log in again.', 401))
    }

    // Grant access to protected route
    req.user = freshUser

    next()
})

// Only for rendered page, we don't want to catch any error
exports.isLoggedIn = async (req, res, next) => {
    // 1) Getting token and check of it's there

    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            // 2) Check if user still exists
            const freshUser = await User.findById(decoded.id)
            if (!freshUser) {
                return next()
            }
            // 3) Check if user change password after the JWT was issued
            if (freshUser.changesPasswordAfter(decoded.iat)) {
                return next()
            }
            // There is a logged in user
            res.locals.user = freshUser
            return next()
        } catch (err) {
            return next()
        }
    }
    next()
}


// Using Wrapper function
// User Roles and Permissions
exports.restrictTo = (...roles) => {
    // because the closure have access to roles
    return (req, res, next) => {
        // roles ['admin','lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on Post email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user with email address.', 404))
    }
    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken()
    // This is the amazing part
    await user.save({ validateBeforeSave: false })  // will save the passwordResetToken, passwordResetExpires into the mongo

    // 3) sent it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a Patch request with your new password and
     passwordConfirm to: ${resetURL}. \n If you did not forget password, please ignore this email`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email !'
        })
    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        return next(new AppError('There was an error sending the email. Try again later'))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // 1.a) Find the user and ensure the token has not expired
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gte: Date.now() } })

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt for the user: implement in the userModel

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res)
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
})


exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password')

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 403))
    }

    // 3) If so, update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    // User.findByIdAndUpdate will not work as intended because the validator under passwordConfirm in userModel

    // 4) Log user in, send JWT
    createSendToken(user, 200, res)
})