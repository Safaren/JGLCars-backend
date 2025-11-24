/*const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "jglcars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = multer({ storage });*/

// src/middlewares/uploadMulter.js
const multer = require("multer");

// 🔥 OBLIGATORIO para Cloudinary (usa buffers)
const storage = multer.memoryStorage();

module.exports = multer({ storage });

