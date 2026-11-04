// Crée (ou promeut) le premier compte ADMIN à partir des variables d'environnement :
//   ADMIN_EMAIL     (obligatoire)
//   ADMIN_PASSWORD  (obligatoire pour créer le compte ; ignoré si le compte existe déjà)
//   ADMIN_NOM       (facultatif, défaut "Administrateur")
// Lancement : npm run seed   (ou npx prisma db seed)
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD;
    const nom = process.env.ADMIN_NOM?.trim() || "Administrateur";

    if (!email) {
        throw new Error("Variable ADMIN_EMAIL manquante");
    }

    const existant = await prisma.user.findUnique({ where: { email } });

    if (existant) {
        // Compte existant : on ne touche pas au mot de passe, on garantit seulement le rôle.
        if (existant.role !== Role.ADMIN) {
            await prisma.user.update({ where: { email }, data: { role: Role.ADMIN } });
            console.log(`Compte ${email} promu ADMIN.`);
        } else {
            console.log(`Compte ${email} déjà ADMIN, rien à faire.`);
        }
        return;
    }

    if (!password) {
        throw new Error("Variable ADMIN_PASSWORD manquante (nécessaire pour créer le compte)");
    }

    await prisma.user.create({
        data: {
            nom,
            email,
            password: await bcrypt.hash(password, 10),
            role: Role.ADMIN,
        },
    });

    console.log(`Compte ADMIN ${email} créé.`);
}

main()
    .catch((error) => {
        console.error(`Seed échoué : ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
