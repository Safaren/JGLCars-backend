
// src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { login, logout, refreshAccessToken,  autoLogin } = require("../controllers/authController");



router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.get("/auto-login", autoLogin);


module.exports = router;
