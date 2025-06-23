const express = require("express");
const {
  create,
  getAll,
  getById,
  getBySize,
  deleted,
} = require("../controllers/productController");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app-images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

router.post("/", upload.array("images", 6), create);
router.get("/", getAll);
router.get("/:id", getById);
router.get("/size/:size", getBySize);
router.delete("/:id", deleted);

module.exports = router;
