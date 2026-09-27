const Booking = require('../models/Booking.js');
const OTP = require('../models/OTP.js');
const Event =require('../models/Event.js');

const{sendOTPEmail, sendBookingEmail} =  require('../utils/email.js');

const generateOTP = ()=>{
    return Math.floor(100000 + Math.random()*900000).toString();
}

exports.sendBookingOTP = async(req,res)=>{
    const otp = generateOTP();
    await OTP.findOneAndDelete({email: req.user.email , action: 'event_booking'});
    await OTP.create({email: req.user.email, otp:otp, action: 'event_booking'});
    await sendOTPEmail({ email: req.user.email, otp, type: 'event_booking' });
    res.json({message: 'OTP sent to email'});
}

exports.bookEvent = async(req,res)=>{
    const{eventId, otp} = req.body;

    const otpRecord = await OTP.findOne({email: req.user.email, otp, action: 'event_booking'});
    if(!otpRecord){
        return res.status(400).json('Invalid or Expired otp');
    }
const existingBooking = await Booking.findOne({userId: req.user._id, eventId});
if(existingBooking){
    return res.status(400).json({message:'You already have booked in this event'});
}

const event = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gt: 0 } },
    { $inc: { availableSeats: -1 } },
    { new: true }
);
if(!event){
    return res.status(400).json({message: 'Event not found or seats are not available'});
}

const booking = await Booking.create({
    userId: req.user._id,
    eventId,
    status: 'confirmed',
    paymentStatus : 'not_paid',
    amount: event.ticketPrice
});
await OTP.deleteMany({email: req.user.email, action: 'event_booking'});
await sendBookingEmail(req.user.email, event.title, booking._id);
res.status(201).json({message:'Booking confirmed! Your seat has been reserved.'});
}
exports.confirmBooking = async(req,res)=>{
    const paymentStatus = req.body.paymentStatus;
    if(!['paid','not_paid'].includes(paymentStatus)){
        return res.status(400).json({message:'Invalid Payment Status'});
    }

    const booking = await Booking.findById(req.params.id).populate('eventId');
    if(!booking){
        return res.status(400).json({message:'Booking not found'});
    }
    const event = await Event.findById(booking.eventId._id);
    if(event.totalSeats <= 0){
        return res.status(400).json({message:"OOPs!Seats are not available"})
    }
    booking.status = 'confirmed';
    if(paymentStatus ){
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.totalSeats = -1;
    await event.save();
    await sendBookingEmail(req.user.email, event.title,booking._id);
    res.json({message:'Booking Confirmed'});
}

exports.getMyBookings = async(req,res) => {
    const query = req.user.role === 'admin' ? {} : {userId: req.user._id};
    const bookings = await Booking.find(query)
        .populate('eventId')
        .populate('userId', 'name email');
    res.json(bookings);
}
exports.cancelBooking = async(req,res) => {
    const booking = await Booking.findById(req.params.id);
    if(!booking){
        return res.status(400).json({message:'Booking not found'})
    }
    if(booking.userId.toString()!==req.user._id.toString()){
        return res.status(403).json({message:'Unauthorized'});
    }
     booking.status = 'cancelled';
     await booking.save();
     
    if(booking.status=== 'confirmed'){
    const event = await Event.findById(booking.eventId._id);
      event.totalSeats += 1;
      await event.save();
    }
    await booking.remove();
    res.json({message:'Booking Cancelled'});
}                                              