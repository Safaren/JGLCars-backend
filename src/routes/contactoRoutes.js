//concesionario-backend/src/routes/contactoRoutes.js

const express = require('express');
const router = express.Router();
const { enviarMensaje, obtenerMensajes } = require('../controllers/contactoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Enviar mensaje de contacto (público o usuario logueado)
router.post('/', enviarMensaje);

// Ver mensajes (solo admin)
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), obtenerMensajes);

module.exports = router;
