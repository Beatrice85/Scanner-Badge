import { prisma } from "../../database/prisma.service"
import { Role } from "@prisma/client"
import { ResultatLiaison, trouverOuCreerFiche } from "./fiche-employe"

export class AuthRepository {

    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }

    async findUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, nom: true, email: true, role: true, employeId: true }
        })
    }

    // Crée le compte et, pour un EMPLOYE, le lie à sa fiche (existante par email, sinon créée),
    // dans une seule transaction : si la fiche ne peut pas être liée ou créée, le compte
    // n'est pas créé non plus. Un ADMIN n'a pas de fiche.
    async createUserAvecFiche(data: { nom: string; email: string; password: string; role: Role }) {
        return prisma.$transaction(async (tx) => {

            const user = await tx.user.create({ data });

            if (data.role !== Role.EMPLOYE) {
                return { user, liaison: null as ResultatLiaison | null };
            }

            const liaison = await trouverOuCreerFiche(tx, { nom: data.nom, email: data.email });

            const userLie = await tx.user.update({
                where: { id: user.id },
                data: { employeId: liaison.employeId }
            });

            return { user: userLie, liaison: liaison as ResultatLiaison | null };
        });
    }

    // Comptes EMPLOYE sans fiche (script prisma/link-employes.ts).
    async findComptesEmployeSansFiche() {
        return prisma.user.findMany({
            where: { role: Role.EMPLOYE, employeId: null },
            select: { id: true, nom: true, email: true },
            orderBy: { createdAt: "asc" }
        });
    }

    // Lie un compte EMPLOYE existant à sa fiche (même logique qu'à l'inscription), en transaction.
    // Renvoie null si le compte n'est plus à traiter (supprimé, ADMIN, ou déjà lié entre-temps).
    async lierCompteExistant(userId: string): Promise<ResultatLiaison | null> {
        return prisma.$transaction(async (tx) => {

            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true, nom: true, email: true, role: true, employeId: true }
            });

            if (!user || user.role !== Role.EMPLOYE || user.employeId) {
                return null;
            }

            const liaison = await trouverOuCreerFiche(tx, { nom: user.nom, email: user.email });

            await tx.user.update({
                where: { id: user.id },
                data: { employeId: liaison.employeId }
            });

            return liaison;
        });
    }

}
