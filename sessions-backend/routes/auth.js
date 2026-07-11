const express = require('express');
const router = express.Router();
const { forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

// POST /auth/forgot-password
router.post('/auth/forgot-password', forgotPassword);

// POST /auth/verify-otp
router.post('/auth/verify-otp', verifyOTP);

// POST /auth/reset-password
router.post('/auth/reset-password', resetPassword);

module.exports = router;
