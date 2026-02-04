require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

/* ======================================================
   🌍 CORS — COOKIES PERFECTAS LOCAL + VERCEL
====================================================== */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://jlgcars.es",
  "https://www.jlgcars.es",
];

const vercelRegex = /^https:\/\/[a-zA-Z0-9\-.]+\.vercel\.app$/;

// 👉 IMPORTANTÍSIMO: CORS VA AL PRINCIPIO
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const isAllowed =
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin);

  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval'");

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

/* ======================================================
   🛡 DESPUÉS DE CORS VIENEN LOS OTROS
====================================================== */
app.use(cookieParser());
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

/* ======================================================
   � PASSPORT (Google OAuth) — ANTES DE RUTAS
====================================================== */
const passport = require("passport");
try {
  const setupPassport = require("./config/passport");
  setupPassport();
  app.use(passport.initialize());
  console.log("✅ Passport Google OAuth configurado");
} catch (e) {
  console.error("❌ Error configurando Passport:", e.message);
}

/* ======================================================
   �🚦 RUTAS
====================================================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/fotos-car", require("./routes/fotoCarRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/favoritos", require("./routes/favoritoRoutes"));
app.use("/api/contacto", require("./routes/contactoRoutes"));
app.use("/meta", require("./routes/metaRoutes"));

// Rutas para settings globales
app.use("/api/settings", require("./routes/settingsRoutes"));

/* ======================================================
   TEST
====================================================== */
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API funcionando 🚗✨" });
});

module.exports = app;
