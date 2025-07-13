const Cart = require("../models/cart");
const Product = require("../models/product");
const Image = require("../models/image");
const Size = require("../models/size");

exports.addToCart = async (req, res) => {
  try {
    const {
      cartId,
      productId,
      uploadedImageId,
      sizeId,
      quantity = 1,
    } = req.body;

    if (!cartId) return res.status(400).json({ error: "cartId is required" });

    const product = await Product.findById(productId);
    const size = await Size.findById(sizeId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!size) return res.status(404).json({ error: "Size not found" });

    const uploadedImage = await Image.findById(uploadedImageId);
    if (!uploadedImage)
      return res.status(404).json({ error: "Uploaded image not found" });

    if (uploadedImage.product.toString() !== productId)
      return res
        .status(400)
        .json({ error: "Image does not belong to the product" });

    let cart = await Cart.findOne({ cartId });

    if (!cart) {
      cart = new Cart({
        cartId,
        products: [
          {
            product: productId,
            uploadedImages: uploadedImageId,
            size: sizeId,
            quantity,
          },
        ],
      });
    } else {
      const existingIndex = cart.products.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.uploadedImages.toString() === uploadedImageId &&
          item.size?.toString() === sizeId
      );

      if (existingIndex > -1) {
        cart.products[existingIndex].quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          uploadedImages: uploadedImageId,
          size: sizeId,
          quantity,
        });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getByCartId = async (req, res) => {
  try {
    const cartId = req.params.cartId;

    const data = await Cart.findOne({ cartId })
      .populate("products.product")
      .populate("products.uploadedImages")
      .populate("products.size");

    if (!data) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Get cart by cartId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleted = async (req, res) => {
  try {
    const itemId = req.params.id;

    const cart = await Cart.findOne({ "products._id": itemId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products = cart.products.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ error: "Invalid productId or quantity" });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Find the product entry in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    // Update quantity
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({ message: "Quantity updated", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.del = async (req, res) => {
  const { userId } = req.params;
  try {
    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
