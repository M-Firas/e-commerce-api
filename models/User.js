const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const CustomError = require("../errors");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a name'],
        minlength: 3,
        maxlength: 30,
    },
    lastName: {
        type: String,
        required: [true, 'please provide a last name'],
        minlength: 2,
        maxlength: 30,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'please provide an email'],
        validate: {
            validator: validator.isEmail,
            message: 'please provide a valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
});

// Hashing the password
UserSchema.pre('save', async function (next) {
    // If the password field is not modified, skip hashing
    if (!this.isModified('password')) return next();
    // Check if the passwords match (this._confirmPassword comes from virtual field)
    if (this.password !== this._confirmPassword) {
        throw new CustomError.BadRequestError('Passwords do not match');
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparing the passwords
UserSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};

// Virtual field for confirmPassword
UserSchema.virtual('confirmPassword')
    .set(function (value) {
        this._confirmPassword = value;
    })
    .get(function () {
        return this._confirmPassword;
    });

module.exports = mongoose.model('User', UserSchema);
