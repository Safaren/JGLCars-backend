// src/app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser");


const app = express();

// middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",                 // para entorno local
      "https://jgl-cars-frontend.vercel.app",   // para producción en Vercel
      /\.vercel\.app$/,
    ],
    credentials: true, // permite cookies entre dominios
  })
);
app.use(express.json());
app.use(cookieParser());

// rutas
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

// ruta raíz
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API del concesionario funcionando' });
});

module.exports = app;
