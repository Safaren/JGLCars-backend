// src/app.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

/* ======================================================
   🌍 CONFIGURACIÓN CORS (VERSIÓN CORRECTA)
====================================================== */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://jlgcars.es",
  "https://www.jlgcars.es",
];

const vercelRegex = /^https:\/\/[a-zA-Z0-9\-.]+\.vercel\.app$/;

app.use((req, res, next) => {
  const origin = req.headers.origin;

  const isAllowed =
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin);

  if (origin && isAllowed) {
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

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   🛡 Seguridad + middleware base
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
   🚦 RUTAS DEL BACKEND
====================================================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/fotos-car", require("./routes/fotoCarRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/favoritos", require("./routes/favoritoRoutes"));
app.use("/api/contacto", require("./routes/contactoRoutes"));
app.use("/meta", require("./routes/metaRoutes"));

/* ======================================================
   TEST
====================================================== */
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API funcionando 🚗✨" });
});

module.exports = app;
