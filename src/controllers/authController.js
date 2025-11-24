const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "un-secret-super-seguro";
console.log("CARGANDO authController DESDE:", __filename);

console.log("🔥 INICIO LOGIN CONTROLLER CORRECTO", Date.now());



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

    // 🔥 TOKEN REAL
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 🔥 RESPUESTA NUEVA
    return res.json({
      message: "LOGIN NUEVO - PRUEBA 123456789",
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
exports.logout = (req, res) => {
  return res.json({ message: "Logout OK" });
};

// ============================================
// REFRESH TOKEN (NO USADO)
// ============================================
exports.refreshAccessToken = (req, res) => {
  return res.status(501).json({ error: "Refresh no implementado" });
};
