// src/middlewares/requireAdmin.js

const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

/* ======================================================
   COOKIE OPTIONS — LOCAL + PRODUCCIÓN
====================================================== */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  const baseOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  // En producción solo forzamos domain si lo indicamos por ENV
  if (isProd && process.env.COOKIE_DOMAIN) {
    return {
      ...baseOptions,
      domain: process.env.COOKIE_DOMAIN,
    };
  }

  // Si no hay COOKIE_DOMAIN, no ponemos domain (funciona en Vercel / previews)
  return baseOptions;
}

module.exports = async function requireAdmin(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
      return res.status(401).json({ error: "No autenticado" });
    }

    let payload;

    // 1️⃣ Validar access token
    try {
      payload = jwt.verify(accessToken, JWT_SECRET);

      // Aceptamos "admin" en cualquier combinación de mayúsculas/minúsculas
      if (!payload.rol || payload.rol.toLowerCase() !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
      }

      req.user = payload;
      return next();
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return res.status(401).json({ error: "Token inválido" });
      }
    }

    // 2️⃣ Access expirado → usar refresh
    if (!refreshToken) {
      return res.status(401).json({ error: "Sesión expirada" });
    }

    let refreshPayload;
    try {
      refreshPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    const user = await prisma.user.findUnique({
      where: { id: refreshPayload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Refresh token no coincide" });
    }

    // 3️⃣ Generar nuevo access token silencioso
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Guardar cookie
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    req.user = {
      id: user.id,
      email: user.email,
      rol: user.rol,
    };

    return next();

  } catch (err) {
    console.error("❌ requireAdmin:", err);
    return res.status(500).json({ error: "Error interno en autenticación" });
  }
};
