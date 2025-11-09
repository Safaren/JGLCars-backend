const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadCarImage } = require('../controllers/uploadController');

// POST /api/cars/:id/image
router.post('/cars/:id/image', authMiddleware, upload.single('image'), uploadCarImage);

module.exports = router;
