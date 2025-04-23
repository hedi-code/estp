const express = require("express");
const { register, verifyEmail, login, resetPassword, resetPasswordRequest } = require("../controllers/authController");
const router = express.Router();
router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password-request", resetPasswordRequest);
module.exports = router;