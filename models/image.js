const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    images: [
      {
        url: { type: String, required: true },
      },
    ],
    text: {
      type: String,
    },
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
