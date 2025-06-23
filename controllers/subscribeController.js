const nodemailer = require("nodemailer");
const Subscribe = require("../models/subscribe");
const transporter = require("../config/email");

exports.create = async (req, res) => {
  try {
    const { email } = req.body;
    const data = new Subscribe({ email });
    const response = await data.save();
    await transporter.sendMail({
      from: '"Photofy" <Info@photofy.co.uk>',
      to: email,
      subject: "You're Subscribed! 🎉 Welcome to Our Newsletter",
      html: `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50;">Welcome to Our Newsletter! 🎉</h2>
      <p style="font-size: 16px; color: #555;">
        Hi <strong>${email || "there"}</strong>,
      </p>
      <p style="font-size: 16px; color: #555;">
        Thank you for subscribing to <strong>Photofy</strong> newsletter. We're excited to have you on board! 🚀
      </p>
      <p style="font-size: 16px; color: #555;">
        You'll now be the first to hear about our latest updates, exclusive offers, and helpful insights delivered right to your inbox.
      </p>

      <!-- Optional CTA Button -->
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://yourwebsite.com/blog" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; display: inline-block;">
          Visit Our Website
        </a>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 14px; color: #999; text-align: center;">
        You received this email because you signed up for our newsletter.<br>
        &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
      </p>
    </div>
  `,
    });

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.all = async (req, res) => {
  try {
    const response = await Subscribe.find();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
