// src/controllers/fotoCarController.js

const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------------------------------------
// GET → Fotos del coche
// --------------------------------------------------
exports.getCarImages = async (req, res) => {
  try {
    const { carId } = req.params;

    const fotos = await prisma.imagen.findMany({
      where: { carId: Number(carId) },
      orderBy: { id: "asc" },
    });

    res.json(fotos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
};

// --------------------------------------------------
// POST → Subir imágenes usando Cloudinary STREAM
// --------------------------------------------------
exports.uploadCarImages = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se subieron archivos" });
    }

    const results = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "jlgcars/coches" },
            async (error, result) => {
              if (error) return reject(error);

              const fotoDb = await prisma.imagen.create({
                data: {
                  url: result.secure_url,
                  carId: Number(carId),
                },
              });

              resolve(fotoDb);
            }
          );

          Readable.from(file.buffer).pipe(uploadStream);
        });
      })
    );

    res.json({
      message: "Imágenes subidas correctamente",
      imagenes: results
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al subir imágenes" });
  }
};

// --------------------------------------------------
// DELETE → Eliminar imagen
// --------------------------------------------------
exports.deleteCarImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imagen = await prisma.imagen.findUnique({
      where: { id: Number(id) },
    });

    if (!imagen)
      return res.status(404).json({ error: "Imagen no encontrada" });

    const publicId = imagen.url.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(`jlgcars/coches/${publicId}`);

    await prisma.imagen.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Imagen eliminada correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
};
