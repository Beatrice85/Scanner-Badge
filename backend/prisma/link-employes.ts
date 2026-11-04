// Lie chaque compte EMPLOYE sans fiche à une fiche Employé, avec la même logique qu'à
// l'inscription : fiche libre de même email (sans tenir compte de la casse), sinon
// création d'une fiche (sans chantier, taux et volume à 0).
//
//   npm run link-employes                 -> simulation : affiche ce qui serait fait, n'écrit rien
//   npm run link-employes -- --appliquer  -> applique (une transaction par compte)
//
// Idempotent : seuls les comptes EMPLOYE sans fiche sont traités ; une 2e exécution ne fait rien.
// Attention : les fiches existantes sans email ne peuvent pas être retrouvées et une nouvelle
// fiche serait créée (doublon possible). Renseignez d'abord leur email (PUT /employes/:id).
import "dotenv/config";
import { prisma } from "../src/database/prisma.service";
import { AuthRepository } from "../src/modules/auth/auth.repository";
import { chercherFicheParEmail, decouperNomComplet, MESSAGE_FICHE_DEJA_LIEE } from "../src/modules/auth/fiche-employe";

async function main() {
    const appliquer = process.argv.includes("--appliquer");
    const repository = new AuthRepository();

    const comptes = await repository.findComptesEmployeSansFiche();

    console.log(appliquer ? "Mode : APPLICATION" : "Mode : SIMULATION (ajoutez --appliquer pour écrire en base)");
    console.log(`${comptes.length} compte(s) EMPLOYE sans fiche employé.`);

    const bilan = { liee: 0, creee: 0, conflit: 0, ignore: 0, erreur: 0 };

    for (const compte of comptes) {
        const libelle = `${compte.nom} <${compte.email}>`;

        if (!appliquer) {
            const { libre, dejaLiee } = await chercherFicheParEmail(prisma, compte.email);
            if (libre) {
                bilan.liee++;
                console.log(`- ${libelle} : serait lié à la fiche existante ${libre.prenom} ${libre.nom} (${libre.id})`);
            } else if (dejaLiee) {
                bilan.conflit++;
                console.log(`- ${libelle} : CONFLIT, ${MESSAGE_FICHE_DEJA_LIEE.toLowerCase()}`);
            } else {
                const { prenom, nom } = decouperNomComplet(compte.nom);
                bilan.creee++;
                console.log(`- ${libelle} : une fiche serait créée (prénom "${prenom}", nom "${nom}")`);
            }
            continue;
        }

        try {
            const resultat = await repository.lierCompteExistant(compte.id);
            if (!resultat) {
                bilan.ignore++;
                console.log(`- ${libelle} : ignoré (déjà lié ou plus EMPLOYE)`);
            } else if (resultat.action === "liee") {
                bilan.liee++;
                console.log(`- ${libelle} : lié à la fiche existante ${resultat.employeId}`);
            } else {
                bilan.creee++;
                console.log(`- ${libelle} : fiche créée et liée ${resultat.employeId}`);
            }
        } catch (error: any) {
            if (error?.status === 409) {
                bilan.conflit++;
                console.log(`- ${libelle} : CONFLIT, ${error.message.toLowerCase()} (rien modifié)`);
            } else {
                bilan.erreur++;
                console.log(`- ${libelle} : ERREUR ${error?.message ?? error} (rien modifié pour ce compte)`);
            }
        }
    }

    const verbe = appliquer ? "" : " (simulation)";
    console.log(`Bilan${verbe} : ${bilan.liee} lié(s) à une fiche existante, ${bilan.creee} fiche(s) créée(s), ` +
        `${bilan.conflit} conflit(s), ${bilan.ignore} ignoré(s), ${bilan.erreur} erreur(s).`);

    if (bilan.erreur > 0) {
        process.exitCode = 1;
    }
}

main()
    .catch((error) => {
        console.error(`Script échoué : ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
