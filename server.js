const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
app.use(cors());
app.use(express.json());
const passport = require("./middlewares/auth");
app.use(passport.initialize());

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("Hi");
});

// Files
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const imageRoutes = require("./routes/imageRoutes");
const contactRoutes = require("./routes/contactRoutes");
const commentRoutes = require("./routes/commentRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");
const paymentRoutes = require("./routes/ordersRoutes");
const cartRoutes = require("./routes/cartRoutes");
const eventsBookRoutes = require("./routes/eventsBookRoutes");
const sizeRoutes = require("./routes/sizeRoutes");

// Routes
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/events", eventsRoutes);
app.use("/image", imageRoutes);
app.use("/contact", contactRoutes);
app.use("/comment", commentRoutes);
app.use("/subscribe", subscribeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/cart", cartRoutes);
app.use("/events-book", eventsBookRoutes);
app.use("/size", sizeRoutes);

//  Packages
const PORT = process.env.PORT;
app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Listening the port ${PORT}`);
});
