const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartId: { type: String, required: true, unique: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        uploadedImages: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "image",
          required: true,
        },
        size: { type: mongoose.Schema.Types.ObjectId, ref: "size" },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
