const express = require("express");
const router = express.Router();
const Order = require("./../models/orders");
const Stripe = require("stripe");
const Size = require("../models/size");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Product = require("../models/product");
const transporter = require("../config/email");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const amountInPence = Math.round(amount * 100); // Convert £14.75 → 1475 pence

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
      products,
      payment,
      buyer,
      name,
      email,
      status,
      phone,
      address,
      sizeId,
    } = req.body;

    if (
      !products ||
      !payment ||
      !buyer ||
      !phone ||
      !address ||
      name ||
      email
    ) {
      return;
    }

    const populatedBuyer = await User.findById(buyer);
    if (!populatedBuyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    // Fetch full product and size details
    const populatedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        const size = await Size.findById(item.size);
        return {
          ...item,
          product,
          size,
        };
      })
    );

    // Create order
    const order = new Order({
      products,
      payment,
      buyer: populatedBuyer._id,
      phone,
      address,
      sizeId,
      name,
      email,
      status: status || "not process",
    });
    await order.save();

    const totalAmount = populatedProducts.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      return acc + price;
    }, 0);

    // Send email to customer
    await transporter.sendMail({
      from: '"Photofy" <Info@photofy.co.uk>',
      to: email,
      subject: "Photofy - Order Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #ef4423; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ef4423; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
              Photofy - Order Confirmation 🎉
            </div>

            <div style="padding: 20px;">
              <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size: 16px;">
                Thank you for your order! We're excited to let you know that we've received your payment and your order is now being processed.
              </p>

              <h2 style="color: #ef4423; font-size: 18px; border-bottom: 2px solid #ef4423; display: inline-block; padding-bottom: 4px;">🧾 Order Summary</h2>
              <div style="margin-top: 10px; line-height: 1.6; font-size: 15px;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Payment ID:</strong> ${payment.id}</p>
                <p><strong>Amount Paid:</strong> £${totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${status || "not process"}</p>
                <p><strong>Items Ordered:</strong></p>
                <ul>
                  ${populatedProducts
                    .map(
                      (item) => `
                    <li>${item.product.title} - Size: ${item.size.size}, Price: £${item.product.price}</li>
                  `
                    )
                    .join("")}
                </ul>
              </div>

              <h2 style="color: #ef4423; font-size: 18px; border-bottom: 2px solid #ef4423; display: inline-block; padding-bottom: 4px; margin-top: 25px;">🚚 Shipping Information</h2>
              <div style="margin-top: 10px; line-height: 1.6; font-size: 15px;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address}</p>
              </div>

              <p style="font-size: 15px; margin-top: 20px;">
                You'll receive another update once your order is shipped. If you have any questions, feel free to contact us at 
                <a href="mailto:info@photofy.co.uk" style="color: #ef4423; text-decoration: none;">info@photofy.co.uk</a>.
              </p>

              <p style="font-size: 16px; margin-top: 30px;">Thanks again for shopping with us!</p>
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

    await transporter.sendMail({
      to: process.env.EMAIL_USER,
      subject: "New Order Received - Photofy",
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
  <div style="max-width: 650px; margin: auto; background-color: #ffffff; border: 1px solid #ef4423; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ef4423; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">📥 New Order Received</h1>
    </div>

    <div style="padding: 25px;">
      <h2 style="color: #ef4423; font-size: 18px; margin-bottom: 15px;">🔍 Order Details</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Status:</strong> ${status || "not process"}</p>
      <p><strong>Amount Paid:</strong> £${totalAmount.toFixed(2)}</p>
      <p><strong>Payment ID:</strong> ${payment.id}</p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;" />

      <h2 style="color: #ef4423; font-size: 18px; margin-bottom: 15px;">👤 Buyer Information</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;" />

      <h2 style="color: #ef4423; font-size: 18px; margin-bottom: 15px;">🛒 Items Ordered</h2>
      <ul style="padding-left: 20px; margin-top: 10px;">
        ${populatedProducts
          .map(
            (item) => `
          <li style="margin-bottom: 8px;">
            <strong>${item.product.title}</strong> — Size: ${item.size.size}, Price: £${item.product.price}
          </li>`
          )
          .join("")}
      </ul>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        You can manage this order in your <a href="https://your-admin-panel-url.com" style="color: #ef4423; text-decoration: none;">Admin Dashboard</a>.
      </p>
    </div>

    <div style="background-color: #ef4423; color: #ffffff; padding: 15px; text-align: center; font-size: 13px;">
      © 2025 Photofy. Admin Notification.
    </div>
  </div>
</div>

  `,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "products.product",
        select: "title size price",
      })
      .populate({
        path: "buyer",
        select: "name email",
      })
      .populate("products.size");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ buyer: userId }) // Corrected here
      .populate({
        path: "products.product",
        select: "title size price",
      })
      .populate({
        path: "buyer",
        select: "name email",
      })
      .populate("products.size");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = order.status.toLowerCase();

    if (["shipped", "delivered", "cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        error: `Cannot cancel an order that is already ${currentStatus}`,
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
