require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ─────────────────────────────────────────────
//  CORS CONFIG PARA RENDER + VERCEL
// ─────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:3000",
  "https://jgl-cars-frontend.vercel.app",
  /.*\.vercel\.app$/
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((o) =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        return callback(null, true);
      }

      console.warn("⛔ Origen no permitido:", origin);
      callback(new Error("No permitido por CORS"));
    },
    credentials: true,
  })
);

// ⭐⭐⭐ MANEJO GLOBAL DE PRE-FLIGHT SIN WILDCARDS ⭐⭐⭐
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    return res.sendStatus(200);
  }
  next();
});

// Headers CORS mínimos necesarios
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  next();
});

// ─────────────────────────────────────────────
//  MIDDLEWARES
// ─────────────────────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ─────────────────────────────────────────────
//  RUTAS
// ─────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const favoritoRoutes = require("./routes/favoritoRoutes");
const contactoRoutes = require("./routes/contactoRoutes");
const piezaRoutes = require("./routes/piezaRoutes");
const fotoPiezaRoutes = require("./routes/fotoPiezaRoutes");
const fotoCarRoutes = require("./routes/fotoCarRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api", uploadRoutes);
app.use("/api/favoritos", favoritoRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/piezas", piezaRoutes);
app.use("/api/fotos-pieza", fotoPiezaRoutes);
app.use("/api/fotos-car", fotoCarRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente 🚀" });
});

module.exports = app;
