const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: { type: String },
});

const Size = mongoose.model("size", sizeSchema);
module.exports = Size;
