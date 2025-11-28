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
/*exports.updateCar = async (req, res) => {
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
*/
// Asegúrate de tener prisma importado:
// const prisma = require('../config/prisma');


exports.updateCar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body || {};
    const data = {};

    // Campos numéricos permitidos
    const numericFields = ["precio", "consumo", "cilindrada", "potencia", "anoFabricacion", "km", "puertas", "plazas"];

    // ENUMS exactos según tu schema
    const VALID_TIPO_VENTA = ["COCHE", "PIEZAS"];
    const VALID_CAMBIO = ["manual", "automatico"];
    const VALID_AMBIENTAL = ["B", "C", "CERO", "ECO", "SIN_ETIQUETA"];

    // Validar / parsear
    for (const key of Object.keys(body)) {
      const val = body[key];

      if (val === "" || val === null || val === undefined) {
        // omitimos campos vacíos
        continue;
      }

      if (numericFields.includes(key)) {
        if (!isNaN(Number(val))) {
          data[key] = Number(val);
        } else {
          // ignoramos valores numéricos inválidos (alternativa: return 400)
          continue;
        }
        continue;
      }
        // ⭐ FECHAS (DateTime)
        if (key === "itv") {
          const dateValue = new Date(val);
          if (!isNaN(dateValue.getTime())) {
            data[key] = dateValue;
          }
          continue;
        }
    // ⭐ VIDEOS (array de strings)
      if (key === "videos") {
        if (Array.isArray(val)) {
          data.videos = val
            .map((v) => String(v).trim())
            .filter((v) => v.length > 0);
        }
        continue;
      }
      // Validar enums
      if (key === "tipoVenta") {
        if (!VALID_TIPO_VENTA.includes(val)) {
          return res.status(400).json({ error: `tipoVenta inválido. Valores válidos: ${VALID_TIPO_VENTA.join(", ")}` });
        }
        data[key] = val;
        continue;
      }

      if (key === "cambio") {
        if (!VALID_CAMBIO.includes(val)) {
          return res.status(400).json({ error: `cambio inválido. Valores válidos: ${VALID_CAMBIO.join(", ")}` });
        }
        data[key] = val;
        continue;
      }

      if (key === "ambiental") {
        if (!VALID_AMBIENTAL.includes(val)) {
          return res.status(400).json({ error: `ambiental inválido. Valores válidos: ${VALID_AMBIENTAL.join(", ")}` });
        }
        data[key] = val;
        continue;
      }

      // Campos de texto / otros
      data[key] = val;
    }
delete data.imagenes;
delete data.defectos;
delete data.piezas;
delete data.mensajes;
delete data.carruselFotos;

 if (Object.keys(data).length === 0) {
      return res.json({ ok: true, message: "Sin cambios" });
    }

    const updated = await prisma.car.update({
      where: { id },
      data,
      include: { imagenes: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Error updateCar:", error);
    return res.status(500).json({ error: error.message || "Error al actualizar el coche" });
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
exports.updateCarruselConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { destacado, carruselFotos } = req.body;

    if (carruselFotos.length > 3) {
      return res.status(400).json({ error: "Máximo 3 imágenes" });
    }

    const updated = await prisma.car.update({
      where: { id: Number(id) },
      data: {
        destacado: Boolean(destacado),
        carruselFotos
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando configuración del carrusel" });
  }
};
// ⭐ ACTUALIZAR CONFIGURACIÓN DEL CARRUSEL
exports.updateCarruselConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { destacado, carruselFotos } = req.body;

    if (carruselFotos.length > 3)
      return res.status(400).json({ error: "Máximo 3 imágenes permitidas" });

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
    res.status(500).json({ error: "Error guardando configuración" });
  }
};