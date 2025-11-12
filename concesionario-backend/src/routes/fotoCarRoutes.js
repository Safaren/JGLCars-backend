const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadCarImages, getCarImages, deleteCarImage } = require("../controllers/fotoCarController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todas las fotos de un coche
router.get("/:carId", getCarImages);

// Subir varias imágenes
router.post("/:carId", upload.array("files", 10), uploadCarImages);

// Eliminar una imagen
router.delete("/:id", deleteCarImage);

module.exports = router;
