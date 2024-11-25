const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide a name'],
        minlength: 3,
        maxlength: 30,
    },
    lastName:{
        type:String,
        required:[true,'please provide a last name'],
        minlength: 2,
        maxlength: 30,
    },
    email:{
        type:String,
        unique:true,
        required:[true,'please provide an email'],
        validate:{
            validator: validator.isEmail,
            message:'please provide a valid email'
        }
    },
    password:{
        type:String,
        required:[true,'please provide a password'],
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user',
    }
})

// hashing the password 
UserSchema.pre('save',async function () {
if(!this.isModified('password')) return;
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password,salt)
})

// comparing the passwords
UserSchema.methods.comparePassword = async function(userPassword) {
const isMatch = await bcrypt.compare(userPassword, this.password);
return isMatch;
}

module.exports = mongoose.model('User',UserSchema);