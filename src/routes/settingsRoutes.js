const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/carousel-mode', settingsController.getCarouselMode);
router.post('/carousel-mode', settingsController.setCarouselMode);

module.exports = router;
