// src/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");

// multer en memoria — necesario para cloudinary STREAM
const upload = multer({ storage: multer.memoryStorage() });

const {
  uploadCarImages,
  getCarImages,
  deleteCarImage,
} = require("../controllers/fotoCarController");

router.get("/fotos-car/:carId", getCarImages);
router.post("/fotos-car/:carId", upload.array("files", 10), uploadCarImages);
router.delete("/fotos-car/:id", deleteCarImage);

module.exports = router;
