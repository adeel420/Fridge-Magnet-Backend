const express = require("express");
const {
  create,
  all,
  getById,
  update,
  deleted,
} = require("../controllers/eventsController");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app-images",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), create);
router.get("/", all);
router.get("/:id", getById);
router.put("/:id", upload.single("image"), update);
router.delete("/:id", deleted);

module.exports = router;
