const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "cambiame";

module.exports = (req, res, next) => {
  // Express recorta la URL según donde se monte el router
  // por eso SIEMPRE tenemos que mirar url completa
  const fullUrl = req.originalUrl || req.url;

  // Permitir SIEMPRE todas las rutas que tengan /auth/
  if (fullUrl.includes("/auth/")) {
    return next();
  }

  const token = req.cookies.accessToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // solo pedimos CSRF en rutas protegidas, no en /auth/*
    if (!csrfHeader || csrfHeader.length < 20) {
      return res.status(403).json({ error: "Token CSRF inválido o ausente" });
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      rol: payload.rol,
    };

    next();

  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
