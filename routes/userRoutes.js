const express = require("express");
const { jwtAuthMiddleware } = require("./../middlewares/jwt");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  loginUserDetails,
  forgotPassword,
  resetPassword,
  allUserDetails,
  changeRole,
  changeLoginPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/", jwtAuthMiddleware, loginUserDetails);
router.get("/all", allUserDetails);
router.put("/update-role/:id", changeRole);
router.put("/update-password/:email", changeLoginPassword);

module.exports = router;
