const mongoose = require("mongoose");
require("dotenv").config();
const mongoUrl = process.env.mongoUrl;
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("Connected to MongoDB");
});
db.on("disconnected", () => {
  console.log("Disconnected to MongoDB");
});
db.on("error", (err) => {
  console.log("Error to connected the MongoDB", err);
});
module.exports = db;
