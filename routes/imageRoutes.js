const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { create } = require("../controllers/imageController");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app-images",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const upload = multer({ storage }).array("images", 60);

router.post("/", upload, create);

module.exports = router;
