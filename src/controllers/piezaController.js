const prisma = require("../config/prisma");

exports.getAll = async (req, res) => {
  try {
    const piezas = await prisma.pieza.findMany({
      include: { car: true },
      orderBy: { id: "desc" },
    });
    res.json(piezas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener piezas" });
  }
};

exports.create = async (req, res) => {
  try {
    const { descripcion, precio, carId } = req.body;
    if (!descripcion || !precio || !carId)
      return res.status(400).json({ error: "Faltan datos" });

    const pieza = await prisma.pieza.create({
      data: {
        descripcion,
        precio: parseFloat(precio),
        carId: parseInt(carId),
      },
    });

    res.status(201).json(pieza);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear pieza" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, precio, carId } = req.body;

    const pieza = await prisma.pieza.update({
      where: { id: parseInt(id) },
      data: {
        descripcion,
        precio: parseFloat(precio),
        carId: parseInt(carId),
      },
    });

    res.json(pieza);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar pieza" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pieza.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Pieza eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar pieza" });
  }
};
