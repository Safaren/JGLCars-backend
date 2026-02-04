import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "jlgcars77@gmail.com";
  const password = "  "; // cámbiala antes de producción

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {}, // si ya existe, no lo tocamos
    create: {
      nombre: "JuanAdmin",
      apellidos: "Lopez Garcia",
      dni: "00000000A",          // inventado, pero obligatorio por tu modelo
      email,
      movil: "600000000",        // necesario por tu modelo
      password: hashedPassword,
      rol: "Admin",
      refreshToken: null
    },
  });

  console.log("Usuario Admin creado:", admin);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
