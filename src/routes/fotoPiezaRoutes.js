const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadMultiple, deleteFoto, getFotosByPieza } = require("../controllers/fotoPiezaController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todas las fotos de una pieza
router.get("/:piezaId", getFotosByPieza);

// Subir una o varias fotos (multipart/form-data)
router.post("/:piezaId", upload.array("files", 10), uploadMultiple);

// Eliminar una foto
router.delete("/:id", deleteFoto);

module.exports = router;
