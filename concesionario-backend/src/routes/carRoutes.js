// src/routes/carRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllCars,
  getCarById,
  createCar,
  deleteCar,
  getCarMessages
} = require('../controllers/carController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rutas públicas
router.get('/', getAllCars);          // Ver todos los coches
router.get('/:id', getCarById);       // Ver un coche por ID
router.get('/:id/mensajes', getCarMessages); // Ver mensajes de un coche

// Rutas protegidas (solo Admin)
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), createCar);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCar);

module.exports = router;
