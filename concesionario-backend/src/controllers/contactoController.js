// concesionario-backend/src/controllers/contactoController.js

const prisma = require('../config/prisma');
const nodemailer = require('nodemailer'); // para enviar correos

// ✅ Crear un nuevo mensaje de contacto
exports.enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje, carId } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Guardar el mensaje en la base de datos
    const nuevoMensaje = await prisma.mensajeContacto.create({
      data: { nombre, email, telefono, mensaje, carId },
    });

    // (Opcional) Enviar correo al administrador
    if (process.env.ADMIN_EMAIL && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Concesionario" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Nuevo mensaje de ${nombre}`,
        text: `
          Nombre: ${nombre}
          Email: ${email}
          Teléfono: ${telefono || 'No proporcionado'}
          Mensaje: ${mensaje}
          Coche ID: ${carId || 'No especificado'}
        `,
      });

      console.log('Correo enviado:', info.messageId);
    }

    res.status(201).json({ message: 'Mensaje enviado correctamente', nuevoMensaje });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};

// ✅ Listar mensajes (solo para administrador)
exports.obtenerMensajes = async (req, res) => {
  try {
    const mensajes = await prisma.mensajeContacto.findMany({
      include: { car: true },
      orderBy: { fecha: 'desc' },
    });

    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
};
