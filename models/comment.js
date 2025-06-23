const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: { type: String },
  rating: { type: Number, enum: [1, 2, 3, 4, 5] },
  product: { type: mongoose.Types.ObjectId, ref: "product" },
  user: { type: mongoose.Types.ObjectId, ref: "user" },
});

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
