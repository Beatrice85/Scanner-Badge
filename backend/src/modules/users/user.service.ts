import { Prisma, Role } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { HttpError } from "../../errors/http-error";
import { AuthPayload } from "../../middleware/auth.middleware";

const MESSAGE_DEJA_LIE = "Cet employé est déjà lié à un autre compte";

export class UserService {

    private repository = new UserRepository();

    async getAll() {

        return this.repository.findAll();

    }


    // Lie un compte à une fiche employé. Effet immédiat sur l'API : authMiddleware relit employeId en base.
    async lierEmploye(id: string, employeId: string | undefined) {

        if (typeof employeId !== "string" || !employeId.trim()) {
            throw new HttpError(400, "employeId est obligatoire");
        }

        const user = await this.repository.findById(id);

        if (!user) {
            throw new HttpError(404, "Utilisateur introuvable");
        }

        const employe = await this.repository.findEmployeById(employeId);

        if (!employe) {
            throw new HttpError(404, "Employé introuvable");
        }

        const dejaLie = await this.repository.findByEmployeId(employeId);

        if (dejaLie) {
            if (dejaLie.id === id) {
                // Déjà lié à ce même compte : rien à changer.
                return dejaLie;
            }
            throw new HttpError(409, MESSAGE_DEJA_LIE);
        }

        try {
            return await this.repository.lierEmploye(id, employeId);
        } catch (error) {
            // Liaison concurrente sur le même employé : contrainte d'unicité users.employeId.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpError(409, MESSAGE_DEJA_LIE);
            }
            throw error;
        }
    }


    // Change le rôle d'un compte. Effet immédiat sur l'API : authMiddleware relit le rôle en base.
    async changerRole(id: string, role: string | undefined, acteur: AuthPayload) {

        if (typeof role !== "string" || !Object.values(Role).includes(role as Role)) {
            throw new HttpError(400, `Rôle invalide. Valeurs possibles : ${Object.values(Role).join(", ")}`);
        }

        if (id === acteur.id) {
            throw new HttpError(403, "Vous ne pouvez pas modifier votre propre rôle");
        }

        const user = await this.repository.findById(id);

        if (!user) {
            throw new HttpError(404, "Utilisateur introuvable");
        }

        if (user.role === role) {
            // Déjà ce rôle : rien à changer.
            return user;
        }

        // Décompte des ADMIN et mise à jour dans la même transaction (lignes ADMIN verrouillées).
        return this.repository.changerRoleEnTransaction(id, role as Role, (cible, nombreAdmins) => {

            if (!cible) {
                throw new HttpError(404, "Utilisateur introuvable");
            }

            if (cible.role === Role.ADMIN && role === Role.EMPLOYE && nombreAdmins <= 1) {
                throw new HttpError(409, "Impossible de rétrograder le dernier administrateur");
            }
        });
    }
}
