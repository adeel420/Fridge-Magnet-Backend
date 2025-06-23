const express = require("express");
const router = express.Router();
const {
  addToCart,
  getByUserId,
  deleted,
  update,
  del,
} = require("../controllers/cartController");
const { jwtAuthMiddleware } = require("../middlewares/jwt");

router.post("/", jwtAuthMiddleware, addToCart);
router.get("/:userId", getByUserId);
router.delete("/:id", deleted);
router.patch("/:cartId", update);
router.delete("/user/:userId", del);

module.exports = router;
