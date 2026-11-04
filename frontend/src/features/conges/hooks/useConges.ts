import { useCallback, useEffect, useState } from 'react';
import congesApi from '../api/conges.api';
import type { Conge, CreateCongePayload, StatutConge, UpdateCongePayload } from '../types';

// Vue ADMIN : GET /conges?statut=, validation et refus.
// statut null : tous les congés.
export default function useConges(statut: StatutConge | null) {
	const [conges, setConges] = useState<Conge[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await congesApi.list(statut ?? undefined);
			setConges(data || []);
		} catch (err: any) {
			setError(err?.message || 'Erreur');
		} finally {
			setLoading(false);
		}
	}, [statut]);

	// Les réponses de POST/PUT/PATCH n'incluent pas l'employé, et un congé traité peut
	// sortir du filtre courant : on recharge la liste après chaque action.
	async function create(payload: CreateCongePayload) {
		const res = await congesApi.create(payload);
		await fetchAll();
		return res;
	}

	async function update(id: string, payload: UpdateCongePayload) {
		const res = await congesApi.update(id, payload);
		await fetchAll();
		return res;
	}

	async function remove(id: string) {
		await congesApi.del(id);
		await fetchAll();
	}

	async function valider(id: string) {
		const res = await congesApi.valider(id);
		await fetchAll();
		return res;
	}

	async function refuser(id: string, motifRefus: string) {
		const res = await congesApi.refuser(id, motifRefus);
		await fetchAll();
		return res;
	}

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	return { conges, loading, error, fetchAll, create, update, remove, valider, refuser };
}
