const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

// ⭐ SOLUCIÓN: asegurar el secret siempre
const JWT_SECRET = process.env.JWT_SECRET || "un-secret-super-seguro";

module.exports = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Intentar leer desde cookies
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2️⃣ Intentar leer desde Authorization: Bearer xxx
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ⭐ CORREGIDO: el token usa "id", NO "userId"
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (user.rol.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ error: "Acceso restringido: solo administradores" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Error en requireAdmin:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
};
