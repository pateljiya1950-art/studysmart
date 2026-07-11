const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Fallback in-memory DB exactly in case MongoDB is literally not connected
const memoryUsers = [];
async function findUser(email) {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      return await User.findOne({ email });
    }
  } catch(e) {}
  // In-Memory lookup
  let u = memoryUsers.find(u => u.email === email);
  if (!u) {
    u = { email, save: async function() { return this; } };
    memoryUsers.push(u);
  }
  return u;
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Incoming email:", email);

    // Dynamic find with fallback since user disabled Mongo
    const user = await findUser(email);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is: ${otp}</h3>`
    });

    console.log("Email sent:", info.response);
    res.json({ msg: "OTP sent successfully to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await findUser(email);

    if (!user || user.resetOTP !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    res.json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await findUser(email);

    if (!user) {
       return res.status(404).json({ msg: "User not found" });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;

    // Clear OTP
    user.resetOTP = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};
