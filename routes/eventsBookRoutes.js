const express = require("express");
const EventsBook = require("../models/eventsBook");
const router = express.Router();
const Stripe = require("stripe");
const transporter = require("../config/email");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your secret key

router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const amountInPence = Math.round(amount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: "gbp",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      eventType,
      eventDate,
      eventLocation,
      additionalInfo,
      payment,
    } = req.body;

    if (!payment?.id) {
      return res.status(400).json({ error: "Payment ID missing" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment.id);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const data = new EventsBook({
      name,
      email,
      phone,
      eventType,
      eventDate,
      eventLocation,
      additionalInfo,
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert pence to pounds
        status: paymentIntent.status,
      },
    });

    const response = await data.save();

    // Send email to customer
    await transporter.sendMail({
      from: '"Photofy" <Info@photofy.co.uk>',
      to: email,
      subject: "Photofy - Event Booking Confirmation",
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: auto; border: 1px solid #ef4423; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ef4423; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
          Photofy - Event Booking Confirmation 🎉
        </div>

        <div style="padding: 20px;">
          <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">
            Thank you for booking your event with Photofy! We’ve successfully received your payment and your booking details are as follows:
          </p>

          <h2 style="color: #ef4423; font-size: 18px; border-bottom: 2px solid #ef4423; display: inline-block; padding-bottom: 4px;">📋 Event Summary</h2>
          <div style="margin-top: 10px; line-height: 1.6; font-size: 15px;">
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>Additional Info:</strong> ${additionalInfo || "N/A"}</p>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Amount Paid:</strong> £${(
              paymentIntent.amount / 100
            ).toFixed(2)}</p>
          </div>

          <h2 style="color: #ef4423; font-size: 18px; border-bottom: 2px solid #ef4423; display: inline-block; padding-bottom: 4px; margin-top: 25px;">📞 Contact Information</h2>
          <div style="margin-top: 10px; line-height: 1.6; font-size: 15px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
          </div>

          <p style="font-size: 15px; margin-top: 20px;">
            If you have any questions, feel free to reach out at 
            <a href="mailto:info@photofy.co.uk" style="color: #ef4423; text-decoration: none;">info@photofy.co.uk</a>.
          </p>

          <p style="font-size: 16px; margin-top: 30px;">We look forward to making your event memorable!</p>
          <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">Warm regards,</p>
          <p style="margin: 0;">Photofy Team</p>
          <p style="margin: 0;"><a href="mailto:info@photofy.co.uk" style="color: #ef4423; text-decoration: none;">info@photofy.co.uk</a></p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 13px; color: #777;">
          © 2025 Photofy. All rights reserved.
        </div>
      </div>
    </div>
  `,
    });

    // Send email to admin
    await transporter.sendMail({
      to: process.env.EMAIL_USER,
      subject: "New Event Booking Received - Photofy",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 650px; margin: auto; background-color: #ffffff; border: 1px solid #ef4423; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #ef4423; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📥 New Event Booking Received</h1>
          </div>

          <div style="padding: 25px;">
            <h2 style="color: #ef4423; font-size: 18px; margin-bottom: 15px;">📋 Event Details</h2>
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>Additional Info:</strong> ${additionalInfo || "N/A"}</p>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Amount Paid:</strong> £${(
              paymentIntent.amount / 100
            ).toFixed(2)}</p>

            <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;" />

            <h2 style="color: #ef4423; font-size: 18px; margin-bottom: 15px;">👤 Client Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              View and manage this booking in your <a href="https://your-admin-panel-url.com" style="color: #ef4423; text-decoration: none;">Admin Dashboard</a>.
            </p>
          </div>

          <div style="background-color: #ef4423; color: #ffffff; padding: 15px; text-align: center; font-size: 13px;">
            © 2025 Photofy. Admin Notification.
          </div>
        </div>
      </div>
    `,
    });

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await EventsBook.find();
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
