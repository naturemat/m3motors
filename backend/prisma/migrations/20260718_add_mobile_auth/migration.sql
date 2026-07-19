-- AlterTable: Add passwordHash + make fields nullable for mobile auth

-- Cliente: add password_hash, make clerk_id and id_mecanico_activo nullable
ALTER TABLE "cliente" ADD COLUMN "password_hash" VARCHAR(255);
ALTER TABLE "cliente" ALTER COLUMN "clerk_id" DROP NOT NULL;
ALTER TABLE "cliente" ALTER COLUMN "id_mecanico_activo" DROP NOT NULL;

-- Mechanic: add password_hash, make clerk_id nullable
ALTER TABLE "mecanico" ADD COLUMN "password_hash" VARCHAR(255);
ALTER TABLE "mecanico" ALTER COLUMN "clerk_id" DROP NOT NULL;
