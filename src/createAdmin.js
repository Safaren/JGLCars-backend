// createAdmin.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jlgcars.com" },
    update: {},
    create: {
      nombre: "Sergio",
      apellidos: "Aparicio",
      dni: "12345678A",
      email: "jlgcars77@gmail.com",
      movil: "600000000",
      password: hashed,
      rol: "Admin",
    },
  });

  console.log("✅ Usuario administrador creado:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
