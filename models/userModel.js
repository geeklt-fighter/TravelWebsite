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
    photo: String,
    role:{
        type:String,
        enum: ['user','guide','lead_guide','admin'],
        default:'user'
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
    passwordChangedAt: Date
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

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // this.password is not available because of select:false
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) { // Note: There is no need a fucking async, becuase the protect cannot receive the return value
    if (this.passwordChangedAt) { // this keyword point to the current document
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        console.log('bitch')
        console.log(changedTimestamp, JWTTimestamp)
        return changedTimestamp > JWTTimestamp
    }

    return false    // meaning user has not changed the password
}

const User = mongoose.model('User', userSchema)

module.exports = User