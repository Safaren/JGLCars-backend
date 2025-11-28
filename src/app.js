// src/app.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

/* ======================================================
   🔐 Middleware Admin
====================================================== */
const requireAdmin = require("./middlewares/requireAdmin");

// 🔵 Ruta protegida
app.get("/api/admin", requireAdmin, (req, res) => {
  res.json({ ok: true, message: "Bienvenido administrador" });
});

/* ======================================================
   📌 Rutas META (corregido: antes estaba dentro de CORS ❌)
====================================================== */
const metaRoutes = require("./routes/metaRoutes");
app.use("/meta", metaRoutes);

/* ======================================================
   🌐 CORS CONFIGURACIÓN PROFESIONAL FINAL
   Compatible con Next.js + Cookies HttpOnly + Producción
====================================================== */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://jlgcars.es",
    "https://www.jlgcars.es",
  ];

  const vercelRegex = /^https:\/\/[a-zA-Z0-9\-.]+\.vercel\.app$/;

  const isLocalhost =
    origin?.startsWith("http://localhost") ||
    origin?.startsWith("http://127.0.0.1");

  const isAllowed =
    isLocalhost ||
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin);

  if (!origin || isAllowed) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
  } else {
    console.warn("⛔ Bloqueado por CORS:", origin);
    return res.status(403).json({ error: "CORS no permitido" });
  }

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

/* ======================================================
   🌐 Manejo de PRE-FLIGHT (OPTIONS)
====================================================== */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    return res.sendStatus(200);
  }
  next();
});

/* ======================================================
   🔐 Seguridad + Parsers
====================================================== */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ======================================================
   🚦 Rutas del Backend
====================================================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/favoritos", require("./routes/favoritoRoutes"));
app.use("/api/contacto", require("./routes/contactoRoutes"));
app.use("/api/piezas", require("./routes/piezaRoutes"));
app.use("/api/fotos-pieza", require("./routes/fotoPiezaRoutes"));
app.use("/api/fotos-car", require("./routes/fotoCarRoutes"));

/* ======================================================
   🟢 Ruta base de verificación
====================================================== */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API funcionando correctamente 🚗✨",
  });
});

module.exports = app;
