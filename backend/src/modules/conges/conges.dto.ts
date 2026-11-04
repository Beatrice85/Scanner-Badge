// employeId : obligatoire pour un ADMIN, ignoré pour un EMPLOYE (pris dans le token).
// motif : facultatif.
export interface CreateCongeDto {
    employeId?: string;
    dateDebut: Date;
    dateFin: Date;
    motif?: unknown;
}

// motif absent : inchangé ; chaîne vide ou null : effacé.
export interface UpdateCongeDto {
    dateDebut?: Date;
    dateFin?: Date;
    motif?: unknown;
}

export interface RefuserCongeDto {
    motifRefus: string;
}
