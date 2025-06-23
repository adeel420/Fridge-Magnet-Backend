const Events = require("../models/events");

exports.create = async (req, res) => {
  try {
    const { title, description, date, address } = req.body;
    let image = "";

    if (req.file) {
      image = req.file.path;
    }

    const newEvent = new Events({
      title,
      description,
      image,
      date,
      address,
    });

    const result = await newEvent.save();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.all = async (req, res) => {
  try {
    const response = await Events.find();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Events.findById(id);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, date, address } = req.body;
    let updateData = { title, description, date, address };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedEvent = await Events.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleted = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Events.findByIdAndDelete(id);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
