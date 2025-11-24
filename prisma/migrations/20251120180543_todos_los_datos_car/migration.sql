-- CreateEnum
CREATE TYPE "Cambio" AS ENUM ('manual', 'automatico');

-- CreateEnum
CREATE TYPE "Ambiental" AS ENUM ('B', 'C', 'CERO', 'ECO');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "ambiental" "Ambiental",
ADD COLUMN     "cambio" "Cambio",
ADD COLUMN     "carroceria" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "garantia" BOOLEAN,
ADD COLUMN     "itv" TIMESTAMP(3),
ADD COLUMN     "km" INTEGER,
ADD COLUMN     "plazas" INTEGER,
ADD COLUMN     "puertas" INTEGER;
