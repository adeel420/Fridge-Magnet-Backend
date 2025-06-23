const nodemailer = require("nodemailer");
const Contact = require("../models/contact");
const transporter = require("../config/email");

// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

exports.create = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const data = new Contact({ name, email, subject, message });
    await data.save();

    await transporter.sendMail({
      to: "Info@photofy.co.uk", // Or use any receiving email you want
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 10px;">New Contact Submission</h2>
          <p style="font-size: 16px; color: #555;"><strong>Name:</strong> ${name}</p>
          <p style="font-size: 16px; color: #555;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 16px; color: #555;"><strong>Subject:</strong> ${subject}</p>
          <p style="font-size: 16px; color: #555;"><strong>Message:</strong></p>
          <div style="font-size: 15px; color: #444; background-color: #fff; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
            ${message}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
        </div> 
      `,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};
