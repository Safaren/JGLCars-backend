const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "un-secret-super-seguro";

module.exports = function authMiddleware(req, res, next) {
  try {
    const header = req.headers["authorization"];

    if (!header) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const token = header.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // ahora req.user.id y req.user.rol están disponibles

    next();
  } catch (err) {
    console.error("❌ Error en authMiddleware:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
};
