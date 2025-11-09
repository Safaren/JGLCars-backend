// src/controllers/carController.js
const prisma = require('../config/prisma');

// Obtener todos los coches
exports.getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: { imagenes: true, defectos: true, piezas: true, mensajes: true },
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
    const data = req.body;
    const newCar = await prisma.car.create({ data });
    res.status(201).json(newCar);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear coche' });
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
