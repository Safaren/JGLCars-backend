// src/test-db.js
const prisma = require('./config/prisma'); // ✅ Usa el cliente centralizado

async function test() {
  const cars = await prisma.car.findMany();
  console.log('Coches en la BD:', cars.length);
}

test()
  .then(() => console.log('Conexión correcta'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
