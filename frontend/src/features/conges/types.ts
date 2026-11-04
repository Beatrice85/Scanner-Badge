// Correspond au modèle Prisma `Conge` (backend/prisma/schema.prisma).
// Les dates arrivent du backend sous forme de chaînes ISO.
export type Conge = {
	id: string;
	employeId: string;
	dateDebut: string;
	dateFin: string;
	createdAt: string;
	// Inclus seulement par GET /conges et GET /conges/:id
	employe?: {
		id: string;
		nom: string;
		prenom: string;
	};
};

// Corps attendu par POST /conges
export type CreateCongePayload = {
	employeId: string;
	dateDebut: string;
	dateFin: string;
};

// Corps accepté par PUT /conges/:id (seules les dates sont modifiables)
export type UpdateCongePayload = {
	dateDebut?: string;
	dateFin?: string;
};
