const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();

// Twilio Setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// 📌 Register with Mobile + OTP
exports.registerWithOTP = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, phone, otp });
    await user.save();

    res.json({ message: "OTP sent to mobile", phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null; // Remove OTP after verification
    await user.save();

    res.json({ message: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Login with Email & Password
exports.loginWithEmail = (req, res) => {
  req.login(req.user, { session: false }, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  });
};

// 📌 Logout
exports.logout = (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
};
