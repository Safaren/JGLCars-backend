const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "cambiame";

// Todas las rutas de autenticación deben poder pasar sin token/session
const AUTH_PREFIX = "/api/auth/";

module.exports = (req, res, next) => {
  // Permitir TODOS los endpoints de /api/auth/* sin exigir token ni CSRF
  if (req.originalUrl.startsWith(AUTH_PREFIX)) {
    return next();
  }

  const token = req.cookies.accessToken;
  const csrfHeader = req.headers["x-csrf-token"];

  // No hay token → no puede autenticarse
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    // Verificar accessToken
    const payload = jwt.verify(token, JWT_SECRET);

    // Validar CSRF (32 caracteres hex → más de 20 chars está bien)
    if (!csrfHeader || csrfHeader.length < 20) {
      return res.status(403).json({ error: "Token CSRF inválido o ausente" });
    }

    // Añadir datos del usuario al request
    req.user = {
      id: payload.userId,
      email: payload.email,
      rol: payload.rol,
    };

    next();

  } catch (err) {
    // AccessToken expirado o inválido
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
