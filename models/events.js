const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  date: { type: String },
  address: { type: String },
  image: { type: String },
});

const Events = mongoose.model("events", eventsSchema);
module.exports = Events;
