const express = require("express");
const { create } = require("../controllers/contactController");
const router = express.Router();

router.post("/", create);

module.exports = router;
