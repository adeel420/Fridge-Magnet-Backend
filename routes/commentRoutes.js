const express = require("express");
const { create, getById } = require("../controllers/commentController");
const router = express.Router();

router.post("/", create);
router.get("/:productId", getById);

module.exports = router;
