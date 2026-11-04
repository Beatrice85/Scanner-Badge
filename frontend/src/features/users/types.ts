import type { Role } from '../auth/types';

// Élément de GET /users (backend/src/modules/users) : jamais de mot de passe.
export type CompteUtilisateur = {
	id: string;
	nom: string;
	email: string;
	role: Role;
	employeId: string | null;
};
