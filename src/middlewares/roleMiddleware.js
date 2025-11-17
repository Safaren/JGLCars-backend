// src/middlewares/roleMiddleware.js
/**
 * roleMiddleware(allowedRoles)
 * - allowedRoles: array de strings con los roles permitidos, p. ej. ['Admin','USER']
 *
 * Uso:
 *  const roleMiddleware = require('./middlewares/roleMiddleware');
 *  app.get('/admin', authMiddleware, roleMiddleware(['Admin','ADMIN']), handler);
 *
 * El middleware asume que authMiddleware ya puso `req.user` con `rol`.
 */

module.exports = (allowedRoles = []) => {
  // normalizamos la lista permitida a mayúsculas para comparaciones case-insensitive
  const normalizedAllowed = allowedRoles.map((r) =>
    typeof r === "string" ? r.toUpperCase() : String(r).toUpperCase()
  );

  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Si el rol no viene definido en el usuario, denegamos
    if (!user.rol) {
      return res.status(403).json({ error: "Acceso denegado: rol no definido" });
    }

    const userRole = String(user.rol).toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: "Acceso denegado: no tienes permiso",
        required: allowedRoles,
        yourRole: user.rol,
      });
    }

    // ok
    next();
  };
};
