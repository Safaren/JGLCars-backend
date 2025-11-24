// src/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCars,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/carController');

const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/roleMiddleware');

// públicas
router.get('/', getAllCars);
router.get('/:id', async (req, res) => {
  // opcional: implementa get by id en tu controller
  res.status(501).json({ error: 'No implementado' });
});

// protegidas (solo Admin)
router.post('/', authMiddleware, roleMiddleware(['Admin', 'ADMIN']), createCar);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'ADMIN']), updateCar);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin', 'ADMIN']), deleteCar);

module.exports = router;
