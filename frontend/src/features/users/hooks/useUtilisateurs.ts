import { useCallback, useEffect, useState } from 'react';
import usersApi from '../api/users.api';
import type { Role } from '../../auth/types';
import type { CompteUtilisateur } from '../types';

export default function useUtilisateurs() {
	const [utilisateurs, setUtilisateurs] = useState<CompteUtilisateur[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await usersApi.list();
			setUtilisateurs(data || []);
		} catch (err: any) {
			setError(err?.message || 'Erreur');
		} finally {
			setLoading(false);
		}
	}, []);

	async function changerRole(id: string, role: Role) {
		const res = await usersApi.changerRole(id, role);
		setUtilisateurs(prev => prev.map(u => (u.id === id ? res : u)));
		return res;
	}

	async function associerEmploye(id: string, employeId: string) {
		const res = await usersApi.associerEmploye(id, employeId);
		setUtilisateurs(prev => prev.map(u => (u.id === id ? res : u)));
		return res;
	}

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	return { utilisateurs, loading, error, fetchAll, changerRole, associerEmploye };
}
