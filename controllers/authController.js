const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const transporter = require("../config/email");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET);

    const newUser = new User({
      name,
      email,
      password, // no hashing here
      verificationToken,
    });

    await newUser.save();

    const verificationLink = `https://fridge-magnets-frontend.vercel.app/auth/verify-email/${verificationToken}`;
    await transporter.sendMail({
      from: '"Photofy" <Info@photofy.co.uk>',
      to: email,
      subject: "Verify Your Email",
      html: ` <p>
        Click the link to verify your email:
        <a
          href="${verificationLink}"
          style="color: white; text-decoration: wavy; background-color: #dd492b; padding: 10px; cursor: pointer; border-radius: 10px;"
          
        >
          Verify Email
        </a>
      </p>`,
    });

    res
      .status(201)
      .json({ msg: "Registration successful, verify your email." });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ msg: "Email already verified" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Email: ", email);
    console.log("Password: ", password);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("User found: ", user);
    console.log("Stored Password Hash: ", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result: ", isMatch);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      console.log("Email not verified");
      return res.status(401).json({ msg: "Please verify your email" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email, id: user._id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Send password reset email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: "No user found with this email" });

    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Token expires in 15 minutes
    });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: '"Photofy" <Info@photofy.co.uk>',
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
    });

    res.status(200).json({ msg: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Handle password reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ msg: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};

exports.loginUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await User.findById(userId);
    res.status(200).json({
      name: data.name,
      email: data.email,
      role: data.role,
      id: data._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.allUserDetails = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const response = await User.findByIdAndUpdate(id, { role: role });
    const data = await response.save();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.changeLoginPassword = async (req, res) => {
  try {
    const email = req.params.email;
    const { password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
