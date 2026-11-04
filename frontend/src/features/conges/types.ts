// Correspond au modèle Prisma `Conge` (backend/prisma/schema.prisma).
// Les dates arrivent du backend sous forme de chaînes ISO.
export type StatutConge = 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';

export type Conge = {
	id: string;
	employeId: string;
	dateDebut: string;
	dateFin: string;
	// Motif de la demande (facultatif)
	motif: string | null;
	statut: StatutConge;
	motifRefus: string | null;
	// Utilisateur (ADMIN) qui a validé ou refusé, et date du traitement
	traiteParId: string | null;
	traiteLe: string | null;
	createdAt: string;
	// Inclus seulement par GET /conges et GET /conges/:id
	employe?: {
		id: string;
		nom: string;
		prenom: string;
	};
};

// Corps de POST /conges. employeId : obligatoire pour un ADMIN ; pour un EMPLOYE,
// le backend utilise l'employé du token (on ne l'envoie pas).
export type CreateCongePayload = {
	employeId?: string;
	dateDebut: string;
	dateFin: string;
	motif?: string;
};

// Corps accepté par PUT /conges/:id : dates et motif (texte vide = motif effacé)
export type UpdateCongePayload = {
	dateDebut?: string;
	dateFin?: string;
	motif?: string;
};
