// src/controllers/carController.js
const prisma = require('../config/prisma');

// ===============================
// 🔵 OBTENER TODOS LOS COCHES
// ===============================
// ===============================
// 🔵 OBTENER COCHES CON PAGINACIÓN
// ===============================
exports.getAllCars = async (req, res) => {
  try {
    // Leer page y limit de query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const skip = (page - 1) * limit;

    // Pedimos coches con skip + take
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        skip,
        take: limit,
        include: {
          imagenes: true,
          defectos: true,
          piezas: true,
          mensajes: true,
        },
        orderBy: { id: "desc" },
      }),

      prisma.car.count(),
    ]);

    const hasMore = page * limit < total;

    return res.json({
      items: cars,
      page,
      limit,
      total,
      hasMore,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener coches" });
  }
};


// ===============================
// 🔵 OBTENER UN COCHE POR ID
// ===============================
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

// ===============================
// 🔵 CREAR COCHE
// ===============================
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

    if (!marca || !model || !precio) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newCar = await prisma.car.create({
      data: {
        marca,
        model,
        precio: parseFloat(precio),
        combustible: combustible || "Gasolina",
        anoFabricacion: anoFabricacion ? parseInt(anoFabricacion) : 2000,
        color: color || "Blanco",

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

    console.log("🔥 CREATECAR:", newCar);

    return res.status(201).json(newCar);

  } catch (error) {
    console.error("❌ Error al crear coche:", error);
    return res.status(400).json({
      error: "Error al crear coche",
      detalle: error.message,
    });
  }
};

// ===============================
// 🔵 ACTUALIZAR COCHE
// ===============================
exports.updateCar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body || {};
    const data = {};

    const numericFields = ["precio","consumo","cilindrada","potencia","anoFabricacion","km","puertas","plazas"];

    const VALID_TIPO_VENTA = ["COCHE", "PIEZAS"];
    const VALID_CAMBIO = ["manual", "automatico"];
    const VALID_AMBIENTAL = ["B", "C", "CERO", "ECO", "SIN_ETIQUETA"];

    for (const key of Object.keys(body)) {
      const val = body[key];

      if (val === "" || val === null || val === undefined) continue;

      if (numericFields.includes(key)) {
        if (!isNaN(Number(val))) data[key] = Number(val);
        continue;
      }

      if (key === "itv") {
        const d = new Date(val);
        if (!isNaN(d.getTime())) data[key] = d;
        continue;
      }

      if (key === "videos") {
        if (Array.isArray(val)) {
          data.videos = val.map(v => String(v).trim()).filter(v => v.length > 0);
        }
        continue;
      }

      if (key === "tipoVenta") {
        if (!VALID_TIPO_VENTA.includes(val)) {
          return res.status(400).json({ error: "tipoVenta inválido" });
        }
        data.tipoVenta = val;
        continue;
      }

      if (key === "cambio") {
        if (!VALID_CAMBIO.includes(val)) {
          return res.status(400).json({ error: "cambio inválido" });
        }
        data.cambio = val;
        continue;
      }

      if (key === "ambiental") {
        if (!VALID_AMBIENTAL.includes(val)) {
          return res.status(400).json({ error: "ambiental inválido" });
        }
        data.ambiental = val;
        continue;
      }

      // Copiar cualquier otro campo
      data[key] = val;
    }


    delete data.imagenes;
    delete data.defectos;
    delete data.piezas;
    delete data.mensajes;

    const updated = await prisma.car.update({
      where: { id },
      data,
      include: { imagenes: true },
    });

    return res.json(updated);

  } catch (error) {
    console.error("Error updateCar:", error);
    return res.status(500).json({ error: "Error al actualizar el coche" });
  }
};

// ===============================
// 🔵 ELIMINAR COCHE
// ===============================
exports.deleteCar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.car.delete({ where: { id } });
    res.json({ message: "Coche eliminado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error al eliminar coche" });
  }
};

// ===============================
// 🔵 MENSAJES DEL COCHE
// ===============================
exports.getCarMessages = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mensajes = await prisma.mensajeContacto.findMany({
      where: { carId: id },
      orderBy: { fecha: "desc" },
    });
    res.json(mensajes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

// ===============================
// 🔵 ACTUALIZAR CARRUSEL DEL COCHE
// ===============================
exports.updateCarruselConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { destacado, carruselFotos } = req.body;

    if (!Array.isArray(carruselFotos)) {
      return res.status(400).json({ error: "carruselFotos debe ser un array" });
    }

    if (carruselFotos.length > 3) {
      return res.status(400).json({ error: "Máximo 3 imágenes permitidas" });
    }

    const updated = await prisma.car.update({
      where: { id: Number(id) },
      data: {
        destacado: Boolean(destacado),
        carruselFotos,
      },
    });

    return res.json(updated);

  } catch (err) {
    console.error("Error carrusel:", err);
    res.status(500).json({ error: "Error guardando configuración del carrusel" });
  }
};
