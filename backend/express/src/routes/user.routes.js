const express = require("express");
const {
  getProfile,
  login,
  logout,
  registerUser,
  forgotPassword,
  resetPassword,
  updateProfile
} = require("../controllers/user.controller");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-profile", isLoggedIn, updateProfile);
router.get("/get-profile", isLoggedIn, getProfile);
router.post("/logout", isLoggedIn, logout);

module.exports = router;

