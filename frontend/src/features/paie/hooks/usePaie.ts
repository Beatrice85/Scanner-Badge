import { useState } from 'react';
import paieApi from '../api/paie.api';
import type { ResultatPaie } from '../types';

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
			return data;
		} catch (err: any) {
			setResultat(null);
			setError(err?.message || 'Erreur');
			return null;
		} finally {
			setLoading(false);
		}
	}

	return { resultat, loading, error, calculer };
}
