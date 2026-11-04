import { Prisma } from "@prisma/client";
import { HttpError } from "../../errors/http-error";

// Liaison automatique compte EMPLOYE <-> fiche Employe, utilisée à l'inscription et par
// le script prisma/link-employes.ts. Toutes les fonctions reçoivent un client de
// transaction : l'appelant décide de la transaction (tout ou rien).

type ClientTx = Prisma.TransactionClient;

export const MESSAGE_FICHE_DEJA_LIEE = "Une fiche employé avec cet email est déjà liée à un autre compte";

// Valeurs d'une fiche créée automatiquement : un admin les complète ensuite.
export const TAUX_HORAIRE_PAR_DEFAUT = 0;
export const VOLUME_MENSUEL_PAR_DEFAUT = 0;

export function normaliserEmail(email: string): string {
    return email.trim().toLowerCase();
}

// "Jean Pierre Dupont" -> prénom "Jean", nom "Pierre Dupont". Un seul mot -> nom, prénom vide.
export function decouperNomComplet(nomComplet: string): { prenom: string; nom: string } {
    const mots = nomComplet.trim().split(/\s+/).filter(Boolean);

    if (mots.length <= 1) {
        return { prenom: "", nom: mots[0] ?? "" };
    }

    return { prenom: mots[0], nom: mots.slice(1).join(" ") };
}

// Fiches ayant cet email (sans tenir compte de la casse) : une libre (sans compte) en priorité.
export async function chercherFicheParEmail(client: ClientTx, email: string) {
    const filtreEmail = { equals: normaliserEmail(email), mode: Prisma.QueryMode.insensitive };

    const libre = await client.employe.findFirst({
        where: { email: filtreEmail, user: { is: null } },
        select: { id: true, nom: true, prenom: true }
    });

    if (libre) {
        return { libre, dejaLiee: false };
    }

    const prise = await client.employe.findFirst({
        where: { email: filtreEmail },
        select: { id: true }
    });

    return { libre: null, dejaLiee: Boolean(prise) };
}

export type ResultatLiaison =
    | { action: "liee"; employeId: string }
    | { action: "creee"; employeId: string };

// Fiche libre de même email -> on la réutilise (pas de doublon). Sinon -> nouvelle fiche
// (nom découpé, email, sans chantier, taux et volume à 0). Ne lie pas le compte : l'appelant
// renseigne User.employeId dans la même transaction.
export async function trouverOuCreerFiche(client: ClientTx, compte: { nom: string; email: string }): Promise<ResultatLiaison> {

    const { libre, dejaLiee } = await chercherFicheParEmail(client, compte.email);

    if (libre) {
        return { action: "liee", employeId: libre.id };
    }

    if (dejaLiee) {
        // Employe.email est unique : impossible de créer une seconde fiche avec cet email.
        throw new HttpError(409, MESSAGE_FICHE_DEJA_LIEE);
    }

    const { prenom, nom } = decouperNomComplet(compte.nom);

    const fiche = await client.employe.create({
        data: {
            nom,
            prenom,
            email: normaliserEmail(compte.email),
            tauxHoraire: TAUX_HORAIRE_PAR_DEFAUT,
            volumeMensuelObligatoire: VOLUME_MENSUEL_PAR_DEFAUT,
            chantierId: null
        },
        select: { id: true }
    });

    return { action: "creee", employeId: fiche.id };
}
