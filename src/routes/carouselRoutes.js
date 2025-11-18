const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "/tmp" }); // temporal, ajusta según entorno

const {
  getSlides,
  uploadSlide,
  deleteSlide,
} = require("../controllers/carouselController");

// Listar slides
router.get("/", getSlides);

// Subir slide (multipart/form-data) - protegida: solo admin puede usar
router.post("/", upload.single("file"), uploadSlide);

// Borrar slide (solo admin)
router.delete("/:id", deleteSlide);

module.exports = router;
