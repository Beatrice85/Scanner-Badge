import type { Conge, StatutConge } from './types';

const JOUR_MS = 24 * 60 * 60 * 1000;

// Nombre de jours calendaires, bornes incluses (affichage uniquement).
export function dureeEnJours(c: Conge): number {
	return Math.round((new Date(c.dateFin).getTime() - new Date(c.dateDebut).getTime()) / JOUR_MS) + 1;
}

export function libelleDuree(c: Conge): string {
	const jours = dureeEnJours(c);
	return `${jours} jour${jours > 1 ? 's' : ''}`;
}

export const LIBELLES_STATUT: Record<StatutConge, string> = {
	EN_ATTENTE: 'En attente',
	VALIDE: 'Validé',
	REFUSE: 'Refusé',
};
