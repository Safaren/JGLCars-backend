const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "cambiame";

const EXCLUDED = [
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/logout"
];

module.exports = (req, res, next) => {
  if (EXCLUDED.includes(req.path)) {
    return next(); // refrescar sin CSRF ni access token
  }

  const token = req.cookies.accessToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);

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
