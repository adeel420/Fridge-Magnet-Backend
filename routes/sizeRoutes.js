const express = require("express");
const {
  create,
  getAll,
  getById,
  update,
  deleted,
} = require("../controllers/sizeController");
const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", deleted);

module.exports = router;
