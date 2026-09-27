const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const OTPModel = require('../models/OTP.js');
const { sendEmail } = require('../utils/email.js');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otpCode}`);
    await OTPModel.create({ email, otp: otpCode, action: 'account_verification' });
    await sendEmail(email, otpCode, 'account verification');

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      email: newUser.email,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found! Please sign-up first' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials! Please check your email and password' });
    }
    if (!user.isVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated OTP for ${email}: ${otpCode}`);
      await OTPModel.findOneAndDelete({ email, action: 'account_verification' });
      await OTPModel.create({ email, otp: otpCode, action: 'account_verification' });
      await sendEmail(email, otpCode, 'account_verification');
      return res.status(400).json({ message: 'Account not verified! A new OTP has been sent to your email.' });
    }
    return res.json({
      message: 'Login successfully',
      user: {
        name: user.name,
        id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTPModel.findOne({ email, otp, action: 'account_verification' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
    }
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { returnDocument: 'after' });
    await OTPModel.deleteMany({ email, action: 'account_verification' });
    return res.json({
      message: 'Account verified successfully! You can now login to your account',
      name: user.name,
      id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTPModel.findOneAndDelete({ email, action: 'account_verification' });
    await OTPModel.create({ email, otp: otpCode, action: 'account_verification' });
    await sendEmail(email, otpCode, 'account verification');
    return res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};