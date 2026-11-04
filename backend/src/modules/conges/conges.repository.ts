import { prisma } from "../../database/prisma.service";
import { StatutConge } from "@prisma/client";

// Congés pris en compte pour le contrôle de chevauchement (les refusés sont ignorés).
const STATUTS_ACTIFS: StatutConge[] = [StatutConge.EN_ATTENTE, StatutConge.VALIDE];

export class CongesRepository {
    async findall(statut?: StatutConge) {
        return  prisma.conge.findMany(
            {
                where: statut ? { statut } : undefined,
                include: { employe: true },
                orderBy: {dateDebut: 'desc' }
            }
        );
    }

    async findById(id :string) {
        return prisma.conge.findUnique(
            {
                where: { id },
                include: { employe: true }
            }

        )
    }

    async findByEmployeId(employeId: string) {
        return prisma.conge.findMany(
            {
                where: { employeId },
                orderBy: { dateDebut: 'desc'}
            }
        )
    }

    async findEmployeById(employeId: string) {
        return prisma.employe.findUnique(
        {
            where: { id: employeId }
        }
    );
    }

    async findOveralapping( employeId: string , dateDebut: Date, dateFin: Date, excludeId?: string ) {
        return prisma.conge.findFirst(
            {
                where: {
                    employeId,
                    statut: { in: STATUTS_ACTIFS },
                    ...(excludeId && { id: { not: excludeId } }),
                    dateDebut: {
                        lte: dateFin
                    },
                    dateFin: {
                        gte: dateDebut
                    }
                }

            }
        )
    }

    async create( data: {employeId: string; dateDebut: Date; dateFin: Date; motif: string | null; }) {
        return prisma.conge.create({ data });
    }

    async update(id: string,   data: { dateDebut?: Date; dateFin?: Date; motif?: string | null; }) {
        return prisma.conge.update(
           {
              where: { id },
              data
           }
        )
    }

    async updateStatut(id: string, data: { statut: StatutConge; traiteParId: string; traiteLe: Date; motifRefus: string | null }) {
        return prisma.conge.update(
           {
              where: { id },
              data
           }
        )
    }

    async delete(id: string) {
        return prisma.conge.delete(
            {
                where: { id }
            }
        )
    }
}
