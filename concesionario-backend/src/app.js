// src/app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// rutas
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');

const contactoRoutes = require('./routes/contactoRoutes');


app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/contacto', contactoRoutes);

// ruta raíz
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API del concesionario funcionando' });
});

module.exports = app;
