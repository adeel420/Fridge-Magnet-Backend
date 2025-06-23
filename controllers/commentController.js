const User = require("../models/user");
const Product = require("../models/product");
const Comment = require("../models/comment");

exports.create = async (req, res) => {
  try {
    const { comment, rating, user, product } = req.body;
    const userId = await User.findById(user);
    const productId = await Product.findById(product);

    const data = new Comment({
      comment,
      rating,
      user: userId,
      product: productId,
    });
    const response = await data.save();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const response = await Comment.find({ product: productId }).populate(
      "user",
      "name"
    );
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
