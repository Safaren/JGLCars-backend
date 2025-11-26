-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "carruselFotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false;
