-- This migration can be retried against databases where the enum types or
-- some columns were already created by earlier migrations.
DO $$
BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "employeId" TEXT,
    ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'EMPLOYE';

ALTER TABLE "users"
    ALTER COLUMN "role" SET DEFAULT 'EMPLOYE';

UPDATE "users"
SET "role" = 'EMPLOYE'
WHERE "role" IS NULL;

ALTER TABLE "users"
    ALTER COLUMN "role" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_employeId_key" ON "users"("employeId");

ALTER TABLE "conges"
    ADD COLUMN IF NOT EXISTS "motifRefus" TEXT,
    ADD COLUMN IF NOT EXISTS "traiteLe" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "traiteParId" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'conges'
          AND column_name = 'statut'
    ) THEN
        ALTER TABLE "conges"
            ADD COLUMN "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE';
        UPDATE "conges" SET "statut" = 'VALIDE';
    ELSE
        ALTER TABLE "conges"
            ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';
        UPDATE "conges"
        SET "statut" = 'VALIDE'
        WHERE "statut" IS NULL;
        ALTER TABLE "conges"
            ALTER COLUMN "statut" SET NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_employeId_fkey'
          AND conrelid = '"users"'::regclass
    ) THEN
        ALTER TABLE "users"
            ADD CONSTRAINT "users_employeId_fkey"
            FOREIGN KEY ("employeId") REFERENCES "employes"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'conges_traiteParId_fkey'
          AND conrelid = '"conges"'::regclass
    ) THEN
        ALTER TABLE "conges"
            ADD CONSTRAINT "conges_traiteParId_fkey"
            FOREIGN KEY ("traiteParId") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
