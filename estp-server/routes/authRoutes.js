const express = require("express");
const { register, resendActivation, verifyEmail, login, resetPassword, resetPasswordRequest, logout } = require("../controllers/authController");
const router = express.Router();
router.post("/register", register);
router.post("/resend-activation", resendActivation);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password-request", resetPasswordRequest);
router.post("/logout", logout)
module.exports = router;