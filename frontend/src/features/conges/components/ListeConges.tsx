import React, { useMemo, useState } from 'react';
import Sidebar from '../../../shared/components/Sidebar';
import FenetreModale from '../../../shared/components/FenetreModale';
import { formaterDate } from '../../../shared/lib/formatage-date';
import useEmployes from '../../employes/hooks/useEmployes';
import useConges from '../hooks/useConges';
import useCongesEmploye from '../hooks/useCongesEmploye';
import FormulaireConge from './FormulaireConge';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';

const JOUR_MS = 24 * 60 * 60 * 1000;

// Nombre de jours calendaires, bornes incluses.
function dureeEnJours(c: Conge): number {
	return Math.round((new Date(c.dateFin).getTime() - new Date(c.dateDebut).getTime()) / JOUR_MS) + 1;
}

export default function ListeConges() {
	const { conges, loading, error, create, update, remove, fetchAll } = useConges();
	const { employes } = useEmployes();
	const [filtreEmployeId, setFiltreEmployeId] = useState('');
	const congesEmploye = useCongesEmploye(filtreEmployeId || null);

	const [editing, setEditing] = useState<Conge | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	// GET /conges/employe/:employeId ne renvoie pas l'employé : on résout le nom
	// à partir de la liste des employés.
	const nomsEmployes = useMemo(() => {
		const map: Record<string, string> = {};
		employes.forEach(e => {
			map[String(e.id)] = `${e.prenom} ${e.nom}`.trim();
		});
		return map;
	}, [employes]);

	const lignes = filtreEmployeId ? congesEmploye.conges : conges;
	const chargement = filtreEmployeId ? congesEmploye.loading : loading;
	const erreurChargement = filtreEmployeId ? congesEmploye.error : error;

	function nomEmploye(c: Conge) {
		if (c.employe) return `${c.employe.prenom} ${c.employe.nom}`.trim();
		return nomsEmployes[c.employeId] || c.employeId;
	}

	function openModal(conge: Conge | null = null) {
		setEditing(conge);
		setIsModalOpen(true);
	}

	function closeModal() {
		setEditing(null);
		setIsModalOpen(false);
	}

	async function rafraichirFiltre() {
		if (filtreEmployeId) await congesEmploye.refetch();
	}

	// Les erreurs du backend remontent au formulaire, qui les affiche.
	async function handleCreate(payload: CreateCongePayload) {
		await create(payload);
		await rafraichirFiltre();
		closeModal();
	}

	async function handleUpdate(id: string, payload: UpdateCongePayload) {
		await update(id, payload);
		await rafraichirFiltre();
		closeModal();
	}

	async function handleDelete(c: Conge) {
		const confirmed = window.confirm(
			`Supprimer le congé de ${nomEmploye(c)} du ${formaterDate(c.dateDebut)} au ${formaterDate(c.dateFin)} ?`,
		);
		if (!confirmed) return;
		setActionError(null);
		try {
			await remove(c.id);
			await rafraichirFiltre();
		} catch (err: any) {
			setActionError(err?.message || 'Erreur lors de la suppression du congé');
			await fetchAll();
		}
	}

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row">
				<Sidebar />
				<main className="flex-1 lg:ml-80 space-y-6">
					<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Dashboard</p>
								<h2 className="mt-2 text-2xl font-semibold text-slate-900">Congés</h2>
								<p className="mt-1 text-sm text-slate-500">Demandes de congé des employés.</p>
							</div>
							<button
								type="button"
								className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
								onClick={() => openModal(null)}
							>
								+ Nouvelle demande
							</button>
						</div>
					</div>

					{(erreurChargement || actionError) && (
						<div role="alert" className="rounded-[22px] border border-rose-300 bg-rose-50 p-4 text-rose-700">
							{actionError || erreurChargement}
						</div>
					)}

					<div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl">
						<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">Liste des congés</h3>
								<p className="text-sm text-slate-500">
									{filtreEmployeId ? `Congés de ${nomsEmployes[filtreEmployeId] || 'l\'employé'}` : 'Tous les employés'}
								</p>
							</div>
							<div>
								<label htmlFor="filtre-employe" className="mb-1 block text-sm font-medium text-slate-600">Filtrer par employé</label>
								<select
									id="filtre-employe"
									value={filtreEmployeId}
									onChange={e => setFiltreEmployeId(e.target.value)}
									className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
								>
									<option value="">Tous les employés</option>
									{employes.map(emp => (
										<option key={String(emp.id)} value={String(emp.id)}>{`${emp.prenom} ${emp.nom}`.trim()}</option>
									))}
								</select>
							</div>
						</div>

						{chargement ? (
							<div className="py-8 text-center text-slate-500">Chargement...</div>
						) : (
							<div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-lg">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-100">
										<tr>
											<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employé</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date début</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date fin</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Durée</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{lignes.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
													Aucun congé enregistré.
												</td>
											</tr>
										) : lignes.map(c => {
											const jours = dureeEnJours(c);
											return (
												<tr key={c.id} className="hover:bg-slate-50">
													<td className="px-4 py-3 text-sm text-slate-700">{nomEmploye(c)}</td>
													<td className="px-4 py-3 text-sm text-slate-500">{formaterDate(c.dateDebut)}</td>
													<td className="px-4 py-3 text-sm text-slate-500">{formaterDate(c.dateFin)}</td>
													<td className="px-4 py-3 text-sm text-slate-500">{jours} jour{jours > 1 ? 's' : ''}</td>
													<td className="px-4 py-3 text-sm">
														<button className="mr-2 rounded-md border border-slate-300 px-2 py-1 text-slate-700 transition hover:bg-slate-100" onClick={() => openModal(c)}>Éditer</button>
														<button className="rounded-md border border-rose-300 px-2 py-1 text-rose-600 transition hover:bg-rose-50" onClick={() => handleDelete(c)}>Supprimer</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</main>
			</div>

			<FenetreModale open={isModalOpen} onClose={closeModal} title={editing?.id ? 'Modifier un congé' : 'Nouvelle demande de congé'}>
				<FormulaireConge
					employes={employes}
					edit={editing}
					employeIdParDefaut={filtreEmployeId}
					onCreate={handleCreate}
					onUpdate={handleUpdate}
					onCancel={closeModal}
				/>
			</FenetreModale>
		</div>
	);
}
