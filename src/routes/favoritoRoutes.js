const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  addFavorito,
  removeFavorito,
  getFavoritos,
} = require('../controllers/favoritoController');

// Ver mis favoritos
router.get('/', authMiddleware, getFavoritos);

// Añadir coche a favoritos
router.post('/', authMiddleware, addFavorito);

// Quitar coche de favoritos
router.delete('/:carId', authMiddleware, removeFavorito);

module.exports = router;
