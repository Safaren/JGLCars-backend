const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const cryptoRandomString = require("crypto-random-string");

const JWT_SECRET = process.env.JWT_SECRET || "cambiame";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshtoken123";

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    // Access Token - caduca pronto
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh Token - dura más tiempo
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // CSRF token aleatorio
    const crypto = require("crypto");
    const csrfToken = crypto.randomBytes(32).toString("hex");


    // Guardar Refresh Token en DB (opcional)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    }).catch(() => {});

    // Cookies seguras
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true, // true en producción
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Enviamos CSRF token en JSON (el frontend lo guarda)
    res.json({
      message: "Login exitoso",
      csrfToken,
      user: { id: user.id, email: user.email, rol: user.rol },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// ✅ Refrescar token de acceso (llamado automáticamente por el frontend)
exports.refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Falta refresh token" });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Refresh token inválido" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Token renovado" });
  } catch (error) {
    console.error("Error al refrescar token:", error);
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// ✅ Logout (borrar cookies)
exports.logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Sesión cerrada" });
};
