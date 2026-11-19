import { useState } from 'react';
import paieApi from '../api/paie.api';
import type { ResultatPaie } from '../types';
import { notifierToast } from '../../../shared/lib/toast';

// Calcul à la demande : pas de chargement automatique, car le backend a besoin
// d'un employé et d'une période.
export default function usePaie() {
	const [resultat, setResultat] = useState<ResultatPaie | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function calculer(employeId: string, dateDebut: string, dateFin: string) {
		setLoading(true);
		setError(null);
		try {
			const data = await paieApi.calculer(employeId, dateDebut, dateFin);
			setResultat(data);
			notifierToast('Fiche de paie calculée.');
			return data;
		} catch (err: unknown) {
			setResultat(null);
			setError(err instanceof Error ? err.message : 'Erreur lors du calcul de la paie.');
			return null;
		} finally {
			setLoading(false);
		}
	}

	return { resultat, loading, error, calculer };
}
