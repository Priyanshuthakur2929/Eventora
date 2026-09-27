const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendEmail = async (email, otp, type = 'account') => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials are not configured. Add EMAIL and EMAIL_PASSWORD in your .env file.');
  }
  const title = type ==='account'? 'Verify your Eventora account': 'Verify your event registration';
  const message = type ==='account'? 'Please use the following otp to verify your account on Eventora.': 'Please use the following otp to verify your event registration on Eventora.';

  const emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `OTP for your ${type}`,
    html: `<div style = "font-family: Arial, sans-serif; text-align:center; padding:20px;">
        <h2 style = "color: #111;">${title} </h2>
        <p style = "font-size: 16px; color:#555;">${message}</p>
        <div style = "font-size: 24px; font-weight: bold; color:#000; margin-top:20px;">${otp}</div>
        <p style = "font-size: 14px; color:#999; margin-top:20px;">This OTP is valid for 5 minutes.</p>
      </div>
    </div>`
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log(`Email sent to ${email} for ${type} with OTP: ${otp}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${email} for ${type}: ${error.message}`);
    throw error;
  }
};

exports.sendOTPEmail = async ({ email, otp, type = 'event_booking' }) => {
  return exports.sendEmail(email, otp, type);
};

exports.sendBookingEmail = async (email, eventTitle, bookingId) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials are not configured. Add EMAIL and EMAIL_PASSWORD in your .env file.');
  }

  return transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: `Booking confirmed: ${eventTitle}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Booking confirmed</h2>
      <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
      <p>Booking ID: ${bookingId}</p>
    </div>`
  });
};