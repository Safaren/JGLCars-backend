// src/middlewares/auth.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "un-secret-super-seguro";

module.exports = function (req, res, next) {
  // Intenta obtener token de Authorization header o de cookies
  let token = null;

  // Opción 1: Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  // Opción 2: Cookie de accessToken
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Falta token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ahora req.user.rol existe
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
