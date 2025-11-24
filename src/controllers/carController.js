// src/controllers/carController.js
const prisma = require('../config/prisma');

// Obtener todos los coches
// Obtener todos los coches
exports.getAllCars = async (req, res) => {
  try {
    

    const cars = await prisma.car.findMany({
      include: {
        imagenes: true,
        defectos: true,
        piezas: true,
        mensajes: true,
      },
    });

    res.json(cars);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener coches' });
  }
};


// Obtener coche por ID
exports.getCarById = async (req, res) => {


  try {
    const id = parseInt(req.params.id);
    const car = await prisma.car.findUnique({
      where: { id },
      include: { imagenes: true, defectos: true, piezas: true, mensajes: true },
    });

    if (!car) return res.status(404).json({ error: 'Coche no encontrado' });
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el coche' });
  }
};

// Crear un coche (solo admin)
exports.createCar = async (req, res) => {
  try {
    const {
      marca,
      model,
      precio,
      combustible,
      anoFabricacion,
      color,
    } = req.body;

    // Validaciones mínimas
    if (!marca || !model || !precio) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Crear coche con valores por defecto para los campos obligatorios
    const newCar = await prisma.car.create({
      data: {
        marca,
        model,
        precio: parseFloat(precio),
        combustible: combustible || "Gasolina",
        anoFabricacion: anoFabricacion ? parseInt(anoFabricacion) : 2000,
        color: color || "Blanco",

        // Valores obligatorios del esquema Prisma
        consumo: 0,
        cilindrada: 1.0,
        potencia: 90,

        matricula: "TEMP-" + Date.now(),
        tipoVenta: "COCHE",

        puertas: 3,
        plazas: 5,
      },
      include: { imagenes: true },
    });
console.log("🔥 CREATECAR DEVOLVIENDO:", newCar);

    return res.status(201).json(newCar);

  } catch (error) {
    console.error("❌ Error al crear coche:", error);
    return res.status(400).json({
      error: "Error al crear coche",
      detalle: error.message,
    });
  }
};

/** Actualizar coche (PUT /api/cars/:id)
 * - Actualiza campos escalares.
 * - Si `imagenes` en body tiene URLs nuevas, crea registros Imagen asociados.
 */
exports.updateCar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      marca,
      model,
      consumo,
      combustible,
      anoFabricacion,
      cilindrada,
      precio,
      potencia,
      color,
      matricula,
      tipoVenta,
      imagenes = [], // array de URLs nuevas que queremos añadir
    } = req.body;

    // Actualizar campos escalares del coche
    const updated = await prisma.car.update({
      where: { id },
      data: {
        marca,
        model,
        consumo: consumo !== undefined ? parseFloat(consumo) : undefined,
        combustible,
        anoFabricacion:
          anoFabricacion !== undefined ? parseInt(anoFabricacion) : undefined,
        cilindrada: cilindrada !== undefined ? parseFloat(cilindrada) : undefined,
        precio: precio !== undefined ? parseFloat(precio) : undefined,
        potencia: potencia !== undefined ? parseFloat(potencia) : undefined,
        color,
        matricula,
        tipoVenta,
      },
      include: { imagenes: true },
    });

    // Si vienen nuevas URLs de imágenes, las creamos (no eliminamos existentes)
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      const createImgs = imagenes.map((url) => ({ url, carId: id }));
      await prisma.imagen.createMany({ data: createImgs });
    }

    // devolver coche actualizado con imágenes (recargar)
    const carWithImgs = await prisma.car.findUnique({
      where: { id },
      include: { imagenes: true },
    });

    res.json(carWithImgs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el coche" });
  }
};

// Eliminar un coche (solo admin)
exports.deleteCar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.car.delete({ where: { id } });
    res.json({ message: 'Coche eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al eliminar coche' });
  }
};

// Obtener mensajes de contacto de un coche concreto
exports.getCarMessages = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mensajes = await prisma.mensajeContacto.findMany({
      where: { carId: id },
      orderBy: { fecha: 'desc' },
    });
    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los mensajes del coche' });
  }
};
