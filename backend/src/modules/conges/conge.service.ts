import { Role, StatutConge } from "@prisma/client";
import { CongesRepository } from "./conges.repository";
import { CreateCongeDto, UpdateCongeDto } from "./conges.dto";
import { AuthPayload } from "../../middleware/auth.middleware";
import { HttpError } from "../../errors/http-error";

export const MOTIF_LONGUEUR_MAX = 500;

// Motif facultatif : undefined -> non fourni ; null ou texte vide -> null ; sinon texte nettoyé.
// 400 si ce n'est pas du texte ou s'il dépasse MOTIF_LONGUEUR_MAX caractères.
export function normaliserMotif(valeur: unknown): string | null | undefined {

    if (valeur === undefined) {
        return undefined;
    }

    if (valeur === null) {
        return null;
    }

    if (typeof valeur !== "string") {
        throw new HttpError(400, "Le motif doit être un texte");
    }

    const motif = valeur.trim();

    if (motif.length > MOTIF_LONGUEUR_MAX) {
        throw new HttpError(400, `Le motif ne doit pas dépasser ${MOTIF_LONGUEUR_MAX} caractères`);
    }

    return motif || null;
}

export class CongeService {

    private repository = new CongesRepository();

    async getAll(statut?: string) {

        if (statut !== undefined && !Object.values(StatutConge).includes(statut as StatutConge)) {
            throw new HttpError(400, `Statut invalide. Valeurs possibles : ${Object.values(StatutConge).join(", ")}`);
        }

        return this.repository.findall(statut as StatutConge | undefined);

    }


    async getById(id: string) {

        const conge = await this.repository.findById(id);

        if(!conge) {
            throw new HttpError(404, "conge Introuvabe")
        }

        return conge
    }


    // Lecture d'un congé : ADMIN, ou l'employé concerné.
    async getByIdPourActeur(id: string, acteur: AuthPayload) {

        const conge = await this.getById(id);

        this.verifierProprietaire(conge.employeId, acteur);

        return conge;
    }


    async getByEmployeId(employeId : string, acteur: AuthPayload) {

        this.verifierProprietaire(employeId, acteur);

        return this.repository.findByEmployeId(employeId)

    }


    async getMine(acteur: AuthPayload) {

        return this.repository.findByEmployeId(this.employeIdDuCompte(acteur))

    }


    async create(data: CreateCongeDto, acteur: AuthPayload) {

        // Un EMPLOYE ne crée que pour lui-même : l'employeId du corps est ignoré.
        const employeId = acteur.role === Role.ADMIN ? data.employeId : this.employeIdDuCompte(acteur);

        if (!employeId) {
            throw new HttpError(400, "employeId est obligatoire");
        }

        const motif = normaliserMotif(data.motif) ?? null;

        const employe = await this.repository.findEmployeById( employeId );

        if (!employe) {
            throw new HttpError(404, "Employé introuvable");
        }

        this.verifierDates(data.dateDebut, data.dateFin);

        const chevauchement = await this.repository.findOveralapping(employeId, data.dateDebut, data.dateFin);

        if(chevauchement) {
            throw new HttpError(400, "Un congé existe déjà sur cette période")
        }

        // Statut initial : EN_ATTENTE (valeur par défaut du schéma), y compris pour un ADMIN.
        return this.repository.create({ employeId, dateDebut: data.dateDebut, dateFin: data.dateFin, motif })
    }


    async update(id: string, data: UpdateCongeDto, acteur: AuthPayload) {

        const conge = await this.getById(id)

        this.verifierModifiable(conge.employeId, conge.statut, acteur, "modifié");

        // undefined : motif inchangé ; null : motif effacé.
        const motif = normaliserMotif(data.motif);

        const dateDebut = data.dateDebut ?? conge.dateDebut
        const dateFin = data.dateFin ?? conge.dateFin

        this.verifierDates(dateDebut, dateFin);

        const chevauchement = await this.repository.findOveralapping(conge.employeId, dateDebut, dateFin, id );

        if (chevauchement) {
            throw new HttpError(400, "Un congé existe déjà sur cette période");
        }

        return this.repository.update(id, {
            ...(data.dateDebut !== undefined && { dateDebut: data.dateDebut }),
            ...(data.dateFin !== undefined && { dateFin: data.dateFin }),
            ...(motif !== undefined && { motif })
        });

    }


    async delete(id: string, acteur: AuthPayload) {

        const conge = await this.getById(id)

        this.verifierModifiable(conge.employeId, conge.statut, acteur, "supprimé");

        return this.repository.delete(id)

    }


    async valider(id: string, acteur: AuthPayload) {

        const conge = await this.getById(id);

        this.verifierEnAttente(conge.statut);

        return this.repository.updateStatut(id, {
            statut: StatutConge.VALIDE,
            traiteParId: acteur.id,
            traiteLe: new Date(),
            motifRefus: null
        });
    }


    async refuser(id: string, motifRefus: string | undefined, acteur: AuthPayload) {

        const motif = motifRefus?.trim();

        if (!motif) {
            throw new HttpError(400, "Le motif de refus est obligatoire");
        }

        const conge = await this.getById(id);

        this.verifierEnAttente(conge.statut);

        return this.repository.updateStatut(id, {
            statut: StatutConge.REFUSE,
            traiteParId: acteur.id,
            traiteLe: new Date(),
            motifRefus: motif
        });
    }


    private employeIdDuCompte(acteur: AuthPayload): string {

        if (!acteur.employeId) {
            throw new HttpError(403, "Ce compte n'est associé à aucun employé");
        }

        return acteur.employeId;
    }


    private verifierProprietaire(employeId: string, acteur: AuthPayload) {

        if (acteur.role !== Role.ADMIN && acteur.employeId !== employeId) {
            throw new HttpError(403, "Accès refusé : ce congé ne vous appartient pas");
        }
    }


    // ADMIN : toujours autorisé. EMPLOYE : seulement son propre congé, et seulement s'il est EN_ATTENTE.
    private verifierModifiable(employeId: string, statut: StatutConge, acteur: AuthPayload, action: string) {

        if (acteur.role === Role.ADMIN) {
            return;
        }

        this.verifierProprietaire(employeId, acteur);

        if (statut !== StatutConge.EN_ATTENTE) {
            throw new HttpError(409, `Seul un congé en attente peut être ${action}`);
        }
    }


    private verifierEnAttente(statut: StatutConge) {

        if (statut !== StatutConge.EN_ATTENTE) {
            throw new HttpError(409, `Transition impossible : le congé est déjà ${statut === StatutConge.VALIDE ? "validé" : "refusé"}`);
        }
    }


    private verifierDates(dateDebut: Date, dateFin: Date) {

        if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
            throw new HttpError(400, "Les dates fournies sont invalides");
        }

        if (dateDebut > dateFin) {
            throw new HttpError(400, "La date de début doit être antérieure ou égale à la date de fin");
        }
    }

}
