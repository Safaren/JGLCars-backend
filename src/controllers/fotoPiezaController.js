const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// ✅ Subir múltiples imágenes
exports.uploadMultiple = async (req, res) => {
  try {
    const { piezaId } = req.params;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No se subieron archivos" });

    const uploads = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "jlgcars/piezas" },
              async (error, result) => {
                if (error) return reject(error);
                // Guardar en BD
                const foto = await prisma.fotoPieza.create({
                  data: {
                    piezaId: parseInt(piezaId),
                    parteCoche: "General",
                    numero: 1,
                    url: result.secure_url,
                  },
                });
                resolve(foto);
              }
            );
            file.stream.pipe(stream);
          })
      )
    );

    res.json({ message: "Fotos subidas correctamente", fotos: uploads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir fotos" });
  }
};

// ✅ Eliminar una foto
exports.deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const foto = await prisma.fotoPieza.findUnique({ where: { id: parseInt(id) } });
    if (!foto) return res.status(404).json({ error: "Foto no encontrada" });

    // Borrar de Cloudinary
    const publicId = foto.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`jlgcars/piezas/${publicId}`);

    // Borrar de BD
    await prisma.fotoPieza.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar foto" });
  }
};
