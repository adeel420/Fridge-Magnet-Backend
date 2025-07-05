const Product = require("../models/product");
const Image = require("../models/image");

exports.create = async (req, res) => {
  try {
    const { product, messages } = req.body;

    const parsedMessages = Array.isArray(messages)
      ? messages
      : JSON.parse(messages);

    const foundProduct = await Product.findById(product);
    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const requiredOrderCount = Number(foundProduct.orders);
    const files = req.files;

    if (
      !files ||
      files.length !== requiredOrderCount ||
      parsedMessages.length !== requiredOrderCount
    ) {
      return res.status(400).json({
        error: `You must upload exactly ${requiredOrderCount} image(s) and messages.`,
      });
    }

    const imageData = files.map((file, index) => ({
      url: file.path || file.secure_url || file.url,
      message: parsedMessages[index] || "", // safe fallback
    }));

    const newImageDoc = await Image.create({
      images: imageData,
      product,
    });

    res.status(201).json({
      _id: newImageDoc._id,
      images: newImageDoc.images,
      product: foundProduct._id.toString(),
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
