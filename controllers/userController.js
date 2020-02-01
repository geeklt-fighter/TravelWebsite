const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Factory = require('../controllers/handlerFactory')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]    // {key: el, value: obj[el]} 
        }
    })
    return newObj
}


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for the password update, please use /updateMyPassword', 400))
    }


    // we don't want update everthing in the body
    // 2) Filtered out unwanted fields names that are not allowed to be updated 
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user documents
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })


    // user.name = 'Jonas'
    // await user.save()   // Because the passwordConfirm is a required field, so the save function is not a correct option
    // We actually can use findById and update

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    })
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

// We actually do not delete that document from the database
// We instead set the account inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}

exports.getUser = Factory.getOne(User)
exports.getAllUsers = Factory.getAll(User)
// Like admin update other users
// Do not update passwords with that
exports.updateUser = Factory.updateOne(User)
exports.deleteUser = Factory.deleteOne(User)