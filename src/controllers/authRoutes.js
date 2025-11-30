const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshAccessToken,
  autoLogin,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshAccessToken);
router.get("/auto-login", autoLogin);

module.exports = router;
