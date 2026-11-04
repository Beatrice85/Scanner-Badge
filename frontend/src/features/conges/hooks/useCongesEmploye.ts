import { useCallback, useEffect, useState } from 'react';
import congesApi from '../api/conges.api';
import type { Conge } from '../types';

// Congés d'un seul employé : GET /conges/employe/:employeId
export default function useCongesEmploye(employeId: string | null) {
	const [conges, setConges] = useState<Conge[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchConges = useCallback(async () => {
		if (!employeId) {
			setConges([]);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await congesApi.listByEmploye(employeId);
			setConges(data || []);
		} catch (err: any) {
			setError(err?.message || 'Erreur');
		} finally {
			setLoading(false);
		}
	}, [employeId]);

	useEffect(() => {
		fetchConges();
	}, [fetchConges]);

	return { conges, loading, error, refetch: fetchConges };
}
