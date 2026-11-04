import { useEffect, useState } from 'react';
import congesApi from '../api/conges.api';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';

export default function useConges() {
	const [conges, setConges] = useState<Conge[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function fetchAll() {
		setLoading(true);
		setError(null);
		try {
			const data = await congesApi.list();
			setConges(data || []);
		} catch (err: any) {
			setError(err?.message || 'Erreur');
		} finally {
			setLoading(false);
		}
	}

	// POST et PUT ne renvoient pas l'employé associé : on recharge la liste
	// (triée par dateDebut desc côté backend) après chaque modification.
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
		setConges(prev => prev.filter(c => c.id !== id));
	}

	useEffect(() => {
		fetchAll();
	}, []);

	return { conges, loading, error, fetchAll, create, update, remove };
}
