const prisma = require('../config/prisma');

// ✅ Añadir coche a favoritos
exports.addFavorito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId } = req.body;

    const existente = await prisma.favorito.findUnique({
      where: { userId_carId: { userId, carId } },
    });

    if (existente) {
      return res.status(400).json({ error: 'El coche ya está en tus favoritos' });
    }

    const favorito = await prisma.favorito.create({
      data: {
        userId,
        carId,
      },
    });

    res.status(201).json({ message: 'Favorito añadido', favorito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al añadir favorito' });
  }
};

// ✅ Eliminar coche de favoritos
exports.removeFavorito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId } = req.params;

    await prisma.favorito.delete({
      where: { userId_carId: { userId, carId: parseInt(carId) } },
    });

    res.json({ message: 'Favorito eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
};

// ✅ Obtener todos los favoritos del usuario
exports.getFavoritos = async (req, res) => {
  try {
    const userId = req.user.id;

    const favoritos = await prisma.favorito.findMany({
      where: { userId },
      include: {
        car: {
          include: {
            imagenes: true, // Incluir imágenes del coche
          },
        },
      },
    });

    res.json({
      favoritos: favoritos.map((f) => ({
        ...f.car,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};
