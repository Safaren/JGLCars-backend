
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { register, login, logout, refreshAccessToken, autoLogin } = require("../controllers/authController");

// URLs dinámicas según NODE_ENV
const isDev = process.env.NODE_ENV !== "production";
const FRONTEND_URL = isDev ? "http://localhost:3000" : "https://jlgcars.es";
const GOOGLE_CALLBACK_URL = isDev ? "http://localhost:4000/api/auth/google/callback" : "https://jlgcars-api.onrender.com/api/auth/google/callback";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshAccessToken);
router.get("/auto-login", autoLogin);

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", { session: false, failureRedirect: FRONTEND_URL }),
	async (req, res) => {
		try {
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

			return res.redirect(FRONTEND_URL);
		} catch (err) {
			console.error("Error en Google callback:", err);
			return res.redirect(FRONTEND_URL);
		}
	}
);

module.exports = router;
