const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  images: [
    {
      url: { type: String, required: true },
    },
  ],
  title: { type: String, required: true },
  description: { type: String, required: true },
  orders: { type: String, required: true },
  size: {
    type: mongoose.Types.ObjectId,
    ref: "size",
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: { type: String, required: true },
  perfectFor: [{ type: String }],
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;
