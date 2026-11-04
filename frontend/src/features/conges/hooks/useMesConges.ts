import { useCallback, useEffect, useState } from 'react';
import congesApi from '../api/conges.api';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';
import { ErreurHttp } from '../../../shared/lib/client-http';

// Vue EMPLOYE : GET /conges/moi. Le backend prend l'employé dans le token.
export default function useMesConges() {
	const [conges, setConges] = useState<Conge[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// 403 sur /conges/moi : compte non lié à une fiche employé (message renvoyé par le backend)
	const [compteNonLie, setCompteNonLie] = useState<string | null>(null);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await congesApi.mesConges();
			setConges(data || []);
			setCompteNonLie(null);
		} catch (err: any) {
			if (err instanceof ErreurHttp && err.status === 403) {
				setCompteNonLie(err.message);
			} else {
				setError(err?.message || 'Erreur');
			}
		} finally {
			setLoading(false);
		}
	}, []);

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

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	return { conges, loading, error, compteNonLie, fetchAll, create, update, remove };
}
