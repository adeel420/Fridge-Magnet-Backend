const Category = require("../models/category");
const Product = require("../models/product");
const Size = require("../models/size");

exports.create = async (req, res) => {
  try {
    const { title, description, orders, size, category, price, perfectFor } =
      req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }
    const sizeId = await Size.findById(size);
    const categoryId = await Category.findById(category);

    if (!sizeId) {
      return res.status(400).json({ error: "Invalid size ID" });
    }
    if (!categoryId) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const images = req.files.map((file) => ({
      url: file.path,
    }));

    const newProduct = new Product({
      title,
      description,
      orders,
      size: sizeId,
      category: categoryId,
      price,
      perfectFor: Array.isArray(perfectFor) ? perfectFor : [perfectFor],
      images,
    });

    const saved = await newProduct.save();
    res.status(200).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    const response = await Product.find(filter).populate('category').populate('size');
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Product.findById(id);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBySize = async (req, res) => {
  try {
    const sizeId = req.params.size; // This should be size ID, not size value
    const data = await Product.find({ size: sizeId }).populate("size");
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleted = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Product.findByIdAndDelete(id);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
