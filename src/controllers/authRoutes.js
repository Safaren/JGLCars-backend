const express = require("express");
const router = express.Router();
const passport = require("passport");

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

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL || "/login" }),
  async (req, res) => {
    try {
      // req.user viene de passport strategy
      const user = req.user;
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
      const prisma = require("../config/prisma");

      function generateAccessToken(u) {
        return jwt.sign({ id: u.id, email: u.email, rol: u.rol }, JWT_SECRET, { expiresIn: "15m" });
      }

      function generateRefreshToken(userId) {
        return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.id);

      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } }).catch(() => {});

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      };

      res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      // Redirect to frontend
      const redirectTo = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(redirectTo);
    } catch (err) {
      console.error("Error en Google callback:", err);
      return res.redirect(process.env.FRONTEND_URL || "/login");
    }
  }
);

module.exports = router;
