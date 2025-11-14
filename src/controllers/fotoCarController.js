const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Obtener fotos de un coche
exports.getCarImages = async (req, res) => {
  try {
    const { carId } = req.params;
    const fotos = await prisma.imagen.findMany({
      where: { carId: parseInt(carId) },
      orderBy: { id: "asc" },
    });
    res.json(fotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
};

// ✅ Subir varias imágenes a Cloudinary
exports.uploadCarImages = async (req, res) => {
  try {
    const { carId } = req.params;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No se subieron archivos" });

    const uploads = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "jlgcars/coches" },
              async (error, result) => {
                if (error) return reject(error);
                const imagen = await prisma.imagen.create({
                  data: {
                    carId: parseInt(carId),
                    url: result.secure_url,
                  },
                });
                resolve(imagen);
              }
            );
            file.stream.pipe(stream);
          })
      )
    );

    res.json({ message: "Imágenes subidas correctamente", imagenes: uploads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir imágenes" });
  }
};

// ✅ Eliminar una imagen
exports.deleteCarImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imagen = await prisma.imagen.findUnique({ where: { id: parseInt(id) } });
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada" });

    const publicId = imagen.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`jlgcars/coches/${publicId}`);

    await prisma.imagen.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
};
