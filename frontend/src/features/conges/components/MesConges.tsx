import { useState } from 'react';
import FenetreModale from '../../../shared/components/FenetreModale';
import { formaterDate } from '../../../shared/lib/formatage-date';
import useMesConges from '../hooks/useMesConges';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';
import { libelleDuree } from '../utils';
import BadgeStatutConge from './BadgeStatutConge';
import FormulaireConge from './FormulaireConge';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';

// Vue EMPLOYE : GET /conges/moi. Demande sans choix d'employé ; modification et
// suppression proposées uniquement pour les congés EN_ATTENTE (le backend le vérifie aussi).
export default function MesConges() {
	const { conges, loading, error, compteNonLie, create, update, remove } = useMesConges();
	const pagination = usePagination(conges);

	const [editing, setEditing] = useState<Conge | null>(null);
	const [formulaireOuvert, setFormulaireOuvert] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	function ouvrirFormulaire(conge: Conge | null) {
		setEditing(conge);
		setFormulaireOuvert(true);
	}

	function fermerFormulaire() {
		setEditing(null);
		setFormulaireOuvert(false);
	}

	async function handleCreate(payload: CreateCongePayload) {
		await create(payload);
		fermerFormulaire();
	}

	async function handleUpdate(id: string, payload: UpdateCongePayload) {
		await update(id, payload);
		fermerFormulaire();
	}

	async function handleDelete(c: Conge) {
		const confirmed = window.confirm(`Annuler votre demande du ${formaterDate(c.dateDebut)} au ${formaterDate(c.dateFin)} ?`);
		if (!confirmed) return;
		setActionError(null);
		try {
			await remove(c.id);
		} catch (err: any) {
			setActionError(err?.message || 'Erreur lors de la suppression du congé');
		}
	}

	if (compteNonLie) {
		return (
			<div role="alert" className="rounded-[24px] border border-amber-300 bg-amber-50 p-6 text-amber-800 shadow-xl">
				<p className="font-semibold">{compteNonLie}</p>
				<p className="mt-2 text-sm">
					Vous ne pouvez pas encore consulter ni demander de congés. Demandez à un administrateur d'associer
					votre compte à votre fiche employé, puis reconnectez-vous.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="flex justify-end">
				<button
					type="button"
					className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
					onClick={() => ouvrirFormulaire(null)}
				>
					+ Demander un congé
				</button>
			</div>

			{(error || actionError) && (
				<div role="alert" className="rounded-[22px] border border-rose-300 bg-rose-50 p-4 text-rose-700">
					{actionError || error}
				</div>
			)}

			<div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl">
				{loading ? (
					<div role="status" aria-live="polite" className="py-8 text-center text-slate-500">Chargement...</div>
				) : (
					<>
					<div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-lg">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-100">
								<tr>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Période</th>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Durée</th>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Motif</th>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{conges.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
											Vous n'avez encore demandé aucun congé.
										</td>
									</tr>
								) : pagination.elementsPage.map(c => (
									<tr key={c.id} className="align-top hover:bg-slate-50">
										<td className="px-4 py-3 text-sm text-slate-700">
											{formaterDate(c.dateDebut)} → {formaterDate(c.dateFin)}
										</td>
										<td className="px-4 py-3 text-sm text-slate-500">{libelleDuree(c)}</td>
										<td className="max-w-xs whitespace-pre-line break-words px-4 py-3 text-sm text-slate-600">
											{c.motif || <span className="text-slate-500">—</span>}
										</td>
										<td className="px-4 py-3 text-sm">
											<BadgeStatutConge statut={c.statut} />
											{c.statut === 'REFUSE' && c.motifRefus && (
												<p className="mt-1 max-w-xs text-xs text-rose-600">Motif du refus : {c.motifRefus}</p>
											)}
										</td>
										<td className="px-4 py-3 text-sm">
											{c.statut === 'EN_ATTENTE' ? (
												<div className="flex flex-wrap gap-2">
													<button className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 transition hover:bg-slate-100" onClick={() => ouvrirFormulaire(c)}>Modifier</button>
													<button className="rounded-md border border-rose-300 px-2 py-1 text-rose-600 transition hover:bg-rose-50" onClick={() => handleDelete(c)}>Supprimer</button>
												</div>
											) : (
												<span className="text-xs text-slate-500">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						total={pagination.total}
						premier={pagination.premier}
						dernier={pagination.dernier}
						taille={pagination.taille}
						onPageChange={pagination.setPage}
						onTailleChange={pagination.setTaille}
						libelle="congés"
					/>
					</>
				)}
			</div>

			<FenetreModale open={formulaireOuvert} onClose={fermerFormulaire} title={editing ? 'Modifier ma demande' : 'Demander un congé'}>
				<FormulaireConge edit={editing} onCreate={handleCreate} onUpdate={handleUpdate} onCancel={fermerFormulaire} />
			</FenetreModale>
		</>
	);
}
