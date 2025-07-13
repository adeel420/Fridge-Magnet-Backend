const express = require("express");
const router = express.Router();
const {
  addToCart,
  getByCartId,
  deleted,
  update,
  del,
} = require("../controllers/cartController");
const { jwtAuthMiddleware } = require("../middlewares/jwt");

router.post("/", addToCart);
router.get("/:cartId", getByCartId);
router.delete("/:id", deleted);

// PATCH: Update quantity of a product in cart
router.patch("/:cartId", update);

// DELETE: Clear entire cart by userId
router.delete("/user/:userId", del);

module.exports = router;
