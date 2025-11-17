// src/app.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ======================================================
// 🌐 CORS CONFIGURACIÓN FINAL
// ======================================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://jgl-cars-frontend.vercel.app",
  /.*\.vercel\.app$/
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir SSR, Postman, llamadas internas sin origin
      if (!origin) return callback(null, true);

      // Permitir ORIGEN EXACTO o subdominios de Vercel
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn("⛔ Origen bloqueado por CORS:", origin);
      return callback(new Error("CORS no permitido"), false);
    },
    credentials: true,
  })
);

// ======================================================
// 🌐 Manejo de PRE-FLIGHT (OPTIONS) compatible con Node 22
// ======================================================
app.options("*", (req, res) => {
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
  res.sendStatus(200);
});

// ======================================================
// 🔐 Seguridad + Parsers
// ======================================================
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ======================================================
// 🚦 Rutas del Backend
// ======================================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/favoritos", require("./routes/favoritoRoutes"));
app.use("/api/contacto", require("./routes/contactoRoutes"));
app.use("/api/piezas", require("./routes/piezaRoutes"));
app.use("/api/fotos-pieza", require("./routes/fotoPiezaRoutes"));
app.use("/api/fotos-car", require("./routes/fotoCarRoutes"));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente 🚗✨" });
});

module.exports = app;
