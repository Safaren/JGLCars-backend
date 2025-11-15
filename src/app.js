// src/app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const app = express();

// ===========================
// 🌐 CORS (Frontend Vercel + Localhost)
// ===========================
const allowedOrigins = [
  "http://localhost:3000",
  "https://jgl-cars-frontend.vercel.app",
  "https://jgl-cars-frontend-safarens-projects.vercel.app",
  "https://jgl-cars-frontend-*",
  /\.vercel\.app$/
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origin (Postman / servidor)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
        return callback(null, true);
      }
      console.log("❌ Bloqueado por CORS:", origin);
      return callback(new Error("CORS no permitido"), false);
    },
    credentials: true,
  })
);

// ===========================
// 🔐 Seguridad + parsing
// ===========================
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ===========================
// 🚦 Rutas
// ===========================
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const piezaRoutes = require("./routes/piezaRoutes");
const fotoPiezaRoutes = require("./routes/fotoPiezaRoutes");
const fotoCarRoutes = require("./routes/fotoCarRoutes");

app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/contacto', contactoRoutes);
app.use("/api/piezas", piezaRoutes);
app.use("/api/fotos-pieza", fotoPiezaRoutes);
app.use("/api/fotos-car", fotoCarRoutes);

// ===========================
// Ruta raíz
// ===========================
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API del concesionario funcionando' });
});

module.exports = app;



