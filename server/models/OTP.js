const mongoose = require('mongoose');
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:Number,
        required:true,
        unique:true
    },action:{
        type:String,
        enum:['account_verification','event_booking','event_registeration'],
        required:true
    },createdAt:{
        type:Date,
        default:Date.now,
        expires:300 // 5 minutes
    }
});

module.exports = mongoose.model('OTP', OTPSchema);