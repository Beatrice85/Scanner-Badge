import { useState } from 'react';

export const TAILLES_PAGE = [10, 20, 30, 50, 100] as const;

// Pagination côté client d'une liste déjà chargée.
// - La page est ramenée dans les bornes si la liste raccourcit (suppression, filtre).
// - Changer la taille de page, ou `cleReinitialisation` (ex. un filtre), revient à la page 1.
export default function usePagination<T>(elements: T[], tailleInitiale: number = TAILLES_PAGE[0], cleReinitialisation?: unknown) {
	const [page, setPage] = useState(1);
	const [taille, setTailleEtat] = useState(tailleInitiale);
	const [cle, setCle] = useState(cleReinitialisation);

	// Ajustement pendant le rendu (recommandé par React plutôt qu'un useEffect) : nouveau filtre -> page 1.
	if (cle !== cleReinitialisation) {
		setCle(cleReinitialisation);
		setPage(1);
	}

	const total = elements.length;
	const totalPages = Math.max(1, Math.ceil(total / taille));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * taille;
	const elementsPage = elements.slice(debut, debut + taille);

	function setTaille(nouvelleTaille: number) {
		setTailleEtat(nouvelleTaille);
		setPage(1);
	}

	return {
		page: pageCourante,
		setPage,
		taille,
		setTaille,
		total,
		totalPages,
		elementsPage,
		// Indices affichés (« 11–20 sur 57 »), base 1
		premier: total === 0 ? 0 : debut + 1,
		dernier: Math.min(debut + taille, total),
	};
}
