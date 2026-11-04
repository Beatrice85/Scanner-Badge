-- AlterTable
ALTER TABLE "employes" ADD COLUMN     "email" TEXT,
ALTER COLUMN "chantierId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employes_email_key" ON "employes"("email");
