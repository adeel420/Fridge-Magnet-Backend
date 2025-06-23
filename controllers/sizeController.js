const Size = require("../models/size");

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const response = new Size(data);
    const result = await response.save();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const response = await Size.find();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Size.findById(id);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const response = await Size.findByIdAndUpdate(id, data);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.deleted = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Size.findByIdAndDelete(id);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
