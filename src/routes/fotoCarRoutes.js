
// src/routes/fotoCarRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadCarImages, getCarImages, deleteCarImage, reorderCarImages } = require("../controllers/fotoCarController");
const requireAdmin = require("../middlewares/requireAdmin");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todas las fotos de un coche
router.get("/:carId", getCarImages);

// Subir varias imágenes
router.post("/:carId",requireAdmin, upload.array("files", 40), uploadCarImages);

// Eliminar una imagen
router.delete("/:id", requireAdmin, deleteCarImage);



router.post("/reorder/:carId",requireAdmin, reorderCarImages);

module.exports = router;


