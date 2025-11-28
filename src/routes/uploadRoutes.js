// src/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");

// multer en memoria — necesario para cloudinary STREAM
const upload = multer({ storage: multer.memoryStorage() });
const requireAdmin = require("../middlewares/requireAdmin");

const {
  uploadCarImages,
  getCarImages,
  deleteCarImage,
} = require("../controllers/fotoCarController");

router.get("/fotos-car/:carId", getCarImages);
router.post("/fotos-car/:carId",requireAdmin, upload.array("files", 10), uploadCarImages);
router.delete("/fotos-car/:id",requireAdmin, deleteCarImage);

module.exports = router;
