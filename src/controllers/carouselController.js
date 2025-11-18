const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Asume cloudinary ya configurado en config/cloudinary.js o similar
// cloudinary.config({ cloud_name, api_key, api_secret });

exports.getSlides = async (req, res) => {
  try {
    const slides = await prisma.carousel.findMany({ orderBy: { id: "asc" } });
    res.json(slides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el carrusel" });
  }
};

exports.uploadSlide = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Falta fichero" });

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "jlgcars/carrusel",
    });

    // Borrar fichero temporal si existe
    try { fs.unlinkSync(req.file.path); } catch {}

    const slide = await prisma.carousel.create({
      data: { url: result.secure_url, public_id: result.public_id },
    });

    res.status(201).json(slide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

exports.deleteSlide = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const slide = await prisma.carousel.findUnique({ where: { id } });
    if (!slide) return res.status(404).json({ error: "Slide no encontrado" });

    // Eliminar de Cloudinary si guardaste public_id
    if (slide.public_id) {
      await cloudinary.uploader.destroy(slide.public_id);
    }

    await prisma.carousel.delete({ where: { id } });
    res.json({ message: "Slide eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar slide" });
  }
};
