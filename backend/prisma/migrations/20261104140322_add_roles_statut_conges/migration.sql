-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYE');

-- CreateEnum
CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- AlterTable
ALTER TABLE "conges" ADD COLUMN     "motifRefus" TEXT,
ADD COLUMN     "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE',
ADD COLUMN     "traiteLe" TIMESTAMP(3),
ADD COLUMN     "traiteParId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employeId" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EMPLOYE';

-- CreateIndex
CREATE UNIQUE INDEX "users_employeId_key" ON "users"("employeId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Les congés existants comptent déjà dans la paie : ils sont considérés comme validés.
UPDATE "conges" SET "statut" = 'VALIDE';
