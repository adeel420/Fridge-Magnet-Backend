const mongoose = require("mongoose");

const eventsBookSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  eventType: { type: String },
  eventDate: { type: String },
  eventLocation: { type: String },
  additionalInfo: { type: String },
  payment: {
    id: String,
    amount: Number,
    status: String,
  },
});

const EventsBook = mongoose.model("eventsBook", eventsBookSchema);
module.exports = EventsBook;
