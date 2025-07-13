const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        size: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "size",
        },
        images: [
          {
            type: String,
          },
        ],
      },
    ],
    payment: {
      id: String,
      amount: Number,
      status: String,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: String,
    email: String,
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      default: "not processed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", OrderSchema);
module.exports = Order;
