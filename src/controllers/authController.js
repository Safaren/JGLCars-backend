// src/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "un-secret-super-seguro";
console.log("CARGANDO authController DESDE:", __filename);

// ============================================
// HELPERS
// ============================================

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: "15m" }   // Vida corta → seguro
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

// ============================================
// ME
// ============================================
exports.me = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, rol: true }
    });

    return res.json({ user });
  } catch (e) {
    return res.json({ user: null });
  }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // 🔥 Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Guardar refresh token en BD
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // 🔥 Enviar refresh token via cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // PON TRUE EN PRODUCCIÓN HTTPS
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    return res.json({
      message: "LOGIN OK",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
    });

  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

// ============================================
// LOGOUT
// ============================================
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null }
      });
    }

    res.clearCookie("refreshToken");

    return res.json({ message: "Logout OK" });
  } catch {
    res.json({ message: "Logout OK" });
  }
};

// ============================================
// REFRESH TOKEN — IMPLEMENTADO ✔
// ============================================
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });

    // Busca el usuario que tiene este refresh token
    const user = await prisma.user.findUnique({
      where: { refreshToken }
    });

    if (!user)
      return res.status(401).json({ error: "Refresh token inválido" });

    // 🔥 Generamos un nuevo access token
    const newAccessToken = generateAccessToken(user);

    // 🔥 ROTACIÓN: generamos refresh token nuevo
    const newRefreshToken = generateRefreshToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    // Enviamos cookie renovada
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // TRUE en prod
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: newAccessToken,
      user: { id: user.id, email: user.email, rol: user.rol }
    });

  } catch (err) {
    console.error("❌ Error en refresh:", err);
    return res.status(401).json({ error: "Token expirado" });
  }
};
