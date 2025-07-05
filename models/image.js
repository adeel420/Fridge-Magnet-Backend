const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    images: [
      {
        url: { type: String, required: true },
        message: { type: String, default: "" }, // ✅ This is correct
      },
    ],

    product: {
      type: mongoose.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("image", imageSchema);
module.exports = Image;
