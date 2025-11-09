const cloudinary = require('../config/cloudinary');
const prisma = require('../config/prisma');

exports.uploadCarImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen' });

    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'coches',
    });

    // Guardar en la base de datos
    const newImage = await prisma.imagen.create({
      data: {
        url: result.secure_url,
        carId: parseInt(req.params.id),
      },
    });

    res.status(201).json({ message: 'Imagen subida correctamente', image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};
