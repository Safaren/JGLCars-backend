// src/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

/* ======================================================
   COOKIE OPTIONS — LOCAL + PRODUCCIÓN (VERCEL)
====================================================== */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  // 🔒 IMPORTANTE: sameSite: "none" REQUIERE secure: true en TODOS los entornos
  // Esto significa que necesitas HTTPS incluso en localhost
  const baseOptions = {
    httpOnly: true,
    secure: true,  // ✅ Ahora funciona correctamente con sameSite: "none"
    sameSite: "none",
    path: "/",
  };

  // En producción añadimos el dominio
  if (isProd) {
    return {
      ...baseOptions,
      domain: ".jlgcars.es",
    };
  }

  // Local development - sin domain pero con secure: true
  return baseOptions;
}

/* ======================================================
   HELPERS
====================================================== */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

/* ======================================================
   LOGIN
====================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Enviar cookies correctas según entorno
    res.cookie("accessToken", accessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "LOGIN OK",
      user: { id: user.id, email: user.email, rol: user.rol },
    });

  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/* ======================================================
   AUTO LOGIN — RENUEVA ACCESS TOKEN
====================================================== */
exports.autoLogin = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.json({ loggedIn: false });

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.json({ loggedIn: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken)
      return res.json({ loggedIn: false });

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      loggedIn: true,
      user: { id: user.id, email: user.email, rol: user.rol },
    });

  } catch (err) {
    console.error("❌ autoLogin:", err);
    return res.json({ loggedIn: false });
  }
};

/* ======================================================
   REFRESH ACCESS TOKEN
====================================================== */
exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Refresh inválido" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ error: "Refresh incorrecto" });

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error("❌ refreshAccessToken:", err);
    return res.status(401).json({ error: "Error refrescando token" });
  }
};

/* ======================================================
   LOGOUT
====================================================== */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
    }

    const opts = { path: "/" };
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) opts.domain = ".jlgcars.es";

    res.clearCookie("accessToken", opts);
    res.clearCookie("refreshToken", opts);

    return res.json({ message: "Logout OK" });

  } catch (err) {
    console.error("❌ logout:", err);
    return res.json({ message: "Logout OK" });
  }
};
