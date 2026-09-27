const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
    },location:{
        type:String,
        required:true
    },cateogary:{
        type:String,
        required:true
    },totalSeats:{
        type:Number,
        required:true
    },availableSeats:{
        type:Number,
    },ticketPrice:{
        type:Number,
        required:true
    },imageUrl:{
        type:String,
    },createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
}, {timestamps: true});
module.exports =  mongoose.model('Event', EventSchema);