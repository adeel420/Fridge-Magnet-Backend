const Product = require("../models/product");
const Image = require("../models/image");

exports.create = async (req, res) => {
  try {
    const { text, product } = req.body;

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const foundProduct = await Product.findById(product);
    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const requiredOrderCount = Number(foundProduct.orders);
    const files = req.files;

    if (!files || files.length !== requiredOrderCount) {
      return res.status(400).json({
        error: `You must upload exactly ${requiredOrderCount} image(s) for this product.`,
      });
    }

    const imageUrls = files.map((file) => ({
      url: file.path || file.secure_url || file.url,
    }));

    const newImageDoc = await Image.create({
      images: imageUrls,
      text,
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
