// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "cambiame";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshtoken123";

// ⭐ Dominio del FRONTEND (Vercel)
const FRONTEND_DOMAIN = ".vercel.app";
;

// ============================================================
// LOGIN
// ============================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // access token (15 min)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // refresh token (7 días)
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const csrfToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // ⭐ COOKIES CORRECTAS PARA FRONTEND ≠ BACKEND
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: FRONTEND_DOMAIN,
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login exitoso",
      csrfToken,
      user: { id: user.id, email: user.email, rol: user.rol },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// ============================================================
// REFRESH TOKEN
// ============================================================
exports.refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "Falta refresh token" });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user)
      return res.status(403).json({ error: "Usuario no encontrado" });

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const csrfToken = crypto.randomBytes(32).toString("hex");

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: FRONTEND_DOMAIN,
      path: "/",
      maxAge: 15 * 60 * 1000,
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);

    res.json({ message: "Token renovado", csrfToken });
  } catch (err) {
    console.error("❌ Error en refresh:", err);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// ============================================================
// LOGOUT
// ============================================================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: FRONTEND_DOMAIN,
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: FRONTEND_DOMAIN,
      path: "/",
    });

    res.json({ message: "Sesión cerrada" });
  } catch (err) {
    console.error("❌ Error en logout:", err);
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
};
