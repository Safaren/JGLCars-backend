// src/app.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();


/* ======================================================
   🌐 CORS CONFIGURACIÓN PROFESIONAL FINAL
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

  // ORIGEN PERMITIDO
  const isLocalhost =
    origin?.startsWith("http://localhost") ||
    origin?.startsWith("http://127.0.0.1");

  const isAllowed =
    isLocalhost ||
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin);

  if (!origin || isAllowed) {
    // Permitir origen válido
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

  // Manejo de preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


/* ======================================================
   🌐 CORS CONFIGURACIÓN FINAL PARA LOCAL + VERCEL + DOMINIO REAL
====================================================== 

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origen (SSR/CLI/Postman)
      if (!origin) return callback(null, true);

      // Dominios permitidos
      const localhost = "http://localhost:3000";
      const domainReal = "https://jlgcars.es";
      const wildcardVercel = /\.vercel\.app$/;

      const isAllowed =
        origin === localhost ||
        origin === domainReal ||
        wildcardVercel.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      console.warn("⛔ Origen bloqueado por CORS:", origin);
      return callback(new Error("CORS no permitido"), false);
    },
    credentials: true,
  })
);
*/

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

// ❗ Eliminado duplicado de uploadRoutes
// app.use("/api", require("./routes/uploadRoutes"));

/* ======================================================
   🟢 Ruta base de verificación
====================================================== */
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente 🚗✨" });
});

module.exports = app;
