import { prisma } from "../../database/prisma.service";
import { Role } from "@prisma/client";

// Champs exposés : jamais le mot de passe.
const CHAMPS_PUBLICS = { id: true, nom: true, email: true, role: true, employeId: true } as const;

export class UserRepository {

    async findAll() {
        return prisma.user.findMany({
            select: CHAMPS_PUBLICS,
            orderBy: { createdAt: "asc" }
        });
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: CHAMPS_PUBLICS
        });
    }

    async findByEmployeId(employeId: string) {
        return prisma.user.findUnique({
            where: { employeId },
            select: CHAMPS_PUBLICS
        });
    }

    async findEmployeById(employeId: string) {
        return prisma.employe.findUnique({
            where: { id: employeId }
        });
    }

    async lierEmploye(id: string, employeId: string) {
        return prisma.user.update({
            where: { id },
            data: { employeId },
            select: CHAMPS_PUBLICS
        });
    }

    // Change le rôle dans une transaction. Les lignes ADMIN sont verrouillées (FOR UPDATE) :
    // deux rétrogradations simultanées sont sérialisées, la seconde voit le décompte à jour.
    // `verifier` reçoit le compte relu dans la transaction et le nombre d'ADMIN ; s'il lève
    // une erreur, la transaction est annulée.
    async changerRoleEnTransaction(
        id: string,
        role: Role,
        verifier: (cible: { id: string; role: Role } | null, nombreAdmins: number) => void
    ) {
        return prisma.$transaction(async (tx) => {
            const admins = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "users" WHERE "role" = 'ADMIN' FOR UPDATE`;

            const cible = await tx.user.findUnique({
                where: { id },
                select: { id: true, role: true }
            });

            verifier(cible, admins.length);

            return tx.user.update({
                where: { id },
                data: { role },
                select: CHAMPS_PUBLICS
            });
        });
    }
}
