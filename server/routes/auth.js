const express = require('express');
const router = express.Router();
const {registerUser, loginUser, verifyOTP, resendOTP} = require('../controllers/authController.js');

router.post('/register', registerUser);
router.post('/login',loginUser);
router.post('/verifyOTP', verifyOTP);
router.post('/resendOTP',resendOTP);

module.exports =router;