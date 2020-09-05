const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs') 

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true, // It's not a validator, will transform email to lowercase
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type:String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead_guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false    // prevent the password from showing when get the user data
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function (el) {
                return el === this.password
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false   // We do not want to leak the active field to the user
    }
})

// between getting the data and saving it to the database
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next()
    }

    // Hash the passwords with cost of 12, need a lot of compute
    this.password = await bcrypt.hash(this.password, 12)

    // Delete the passwordConfirm field
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next()
    }

    this.passwordChangedAt = Date.now()
    next() 
})

// Query middleware
userSchema.pre(/^find/, function (next) {    // "/^find/": not just find, also find and update, find and delete, and so on 
    // this point to the current query  [ userController >> getAllUsers >> User.find() ]
    this.find({ active: { $ne: false } })   // we don't use {active: true} because other documents has no active field 
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // this.password is not available because of select:false
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) { // Note: There is no need a fucking async, becuase the protect cannot receive the return value
    if (this.passwordChangedAt) { 
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return changedTimestamp > JWTTimestamp
    }

    return false    
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User