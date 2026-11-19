import { useState } from 'react';
import FenetreModale from '../../../shared/components/FenetreModale';
import { formaterDate } from '../../../shared/lib/formatage-date';
import useEmployes from '../../employes/hooks/useEmployes';
import useConges from '../hooks/useConges';
import type { Conge, CreateCongePayload, StatutConge, UpdateCongePayload } from '../types';
import { LIBELLES_STATUT, libelleDuree } from '../utils';
import BadgeStatutConge from './BadgeStatutConge';
import FormulaireConge from './FormulaireConge';
import ModaleRefusConge from './ModaleRefusConge';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import SqueletteTableau from '../../../shared/components/SqueletteTableau';
import EtatVide from '../../../shared/components/EtatVide';
import EtatErreur from '../../../shared/components/EtatErreur';

const FILTRES: { valeur: StatutConge | null; libelle: string }[] = [
	{ valeur: 'EN_ATTENTE', libelle: LIBELLES_STATUT.EN_ATTENTE },
	{ valeur: 'VALIDE', libelle: LIBELLES_STATUT.VALIDE },
	{ valeur: 'REFUSE', libelle: LIBELLES_STATUT.REFUSE },
	{ valeur: null, libelle: 'Tous' },
];

function nomEmploye(c: Conge) {
	return c.employe ? `${c.employe.prenom} ${c.employe.nom}`.trim() : c.employeId;
}

// Vue ADMIN : GET /conges?statut= (défaut EN_ATTENTE), validation, refus avec motif.
export default function VueCongesAdmin() {
	const [statut, setStatut] = useState<StatutConge | null>('EN_ATTENTE');
	const { conges, loading, error, fetchAll, create, update, remove, valider, refuser } = useConges(statut);
	const pagination = usePagination(conges, undefined, statut);
	const { employes } = useEmployes();

	const [editing, setEditing] = useState<Conge | null>(null);
	const [formulaireOuvert, setFormulaireOuvert] = useState(false);
	const [aRefuser, setARefuser] = useState<Conge | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [enCours, setEnCours] = useState<string | null>(null);

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

	// Erreurs du backend (409 transition impossible, 404...) affichées telles quelles.
	async function executer(c: Conge, action: () => Promise<unknown>) {
		setActionError(null);
		setEnCours(c.id);
		try {
			await action();
		} catch (err: any) {
			setActionError(err?.message || 'Erreur');
		} finally {
			setEnCours(null);
		}
	}

	function handleDelete(c: Conge) {
		const confirmed = window.confirm(
			`Supprimer le congé de ${nomEmploye(c)} du ${formaterDate(c.dateDebut)} au ${formaterDate(c.dateFin)} ?`,
		);
		if (confirmed) executer(c, () => remove(c.id));
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
					{FILTRES.map(f => (
						<button
							key={f.libelle}
							type="button"
							aria-pressed={statut === f.valeur}
							onClick={() => setStatut(f.valeur)}
							className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
								statut === f.valeur
									? 'border-blue-600 bg-blue-600 text-white'
									: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
							}`}
						>
							{f.libelle}
						</button>
					))}
				</div>
				<button
					type="button"
					className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
					onClick={() => ouvrirFormulaire(null)}
				>
					+ Créer un congé
				</button>
			</div>

			{actionError && (
				<div role="alert" className="rounded-bloc border border-rose-300 bg-rose-50 p-4 text-rose-700">
					{actionError}
				</div>
			)}

			<div className="rounded-carte border border-slate-200 bg-white p-4 shadow-xl">
				{loading ? (
					<SqueletteTableau colonnes={6} libelle="Chargement des congés…" />
				) : error ? (
					<EtatErreur message={error} onReessayer={fetchAll} />
				) : (
					<>
					<div className="overflow-x-auto rounded-bloc border border-slate-200 bg-white shadow-lg">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-100">
								<tr>
									<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employé</th>
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
										<td colSpan={6}>
											{statut === 'EN_ATTENTE' ? (
												<EtatVide positif titre="Aucune demande en attente" description="Toutes les demandes de congé ont été traitées." />
											) : (
												<EtatVide
													titre="Aucun congé"
													description="Aucune demande ne correspond à ce filtre."
													action={{ libelle: '+ Créer un congé', onClick: () => ouvrirFormulaire(null) }}
												/>
											)}
										</td>
									</tr>
								) : pagination.elementsPage.map(c => (
									<tr key={c.id} className="align-top hover:bg-slate-50">
										<td className="px-4 py-3 text-sm text-slate-700">{nomEmploye(c)}</td>
										<td className="px-4 py-3 text-sm text-slate-500">
											{formaterDate(c.dateDebut)} → {formaterDate(c.dateFin)}
										</td>
										<td className="px-4 py-3 text-sm text-slate-500">{libelleDuree(c)}</td>
										<td className="max-w-xs whitespace-pre-line break-words px-4 py-3 text-sm text-slate-600">
											{c.motif || <span className="text-slate-500">—</span>}
										</td>
										<td className="px-4 py-3 text-sm">
											<BadgeStatutConge statut={c.statut} />
											{c.traiteLe && (
												<p className="mt-1 text-xs text-slate-500">Traité le {formaterDate(c.traiteLe)}</p>
											)}
											{c.statut === 'REFUSE' && c.motifRefus && (
												<p className="mt-1 max-w-xs text-xs text-rose-600">Motif du refus : {c.motifRefus}</p>
											)}
										</td>
										<td className="px-4 py-3 text-sm">
											<div className="flex flex-wrap gap-2">
												{c.statut === 'EN_ATTENTE' && (
													<>
														<button
															disabled={enCours === c.id}
															className="rounded-full border border-emerald-300 px-3 py-1 font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
															onClick={() => executer(c, () => valider(c.id))}
														>
															Valider
														</button>
														<button
															disabled={enCours === c.id}
															className="rounded-full border border-rose-300 px-3 py-1 font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
															onClick={() => { setActionError(null); setARefuser(c); }}
														>
															Refuser
														</button>
													</>
												)}
												<button
													disabled={enCours === c.id}
													className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
													onClick={() => ouvrirFormulaire(c)}
												>
													Éditer
												</button>
												<button
													disabled={enCours === c.id}
													className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-60"
													onClick={() => handleDelete(c)}
												>
													Supprimer
												</button>
											</div>
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

			<FenetreModale open={formulaireOuvert} onClose={fermerFormulaire} title={editing ? 'Modifier un congé' : 'Créer un congé'}>
				<FormulaireConge
					employes={employes}
					edit={editing}
					onCreate={handleCreate}
					onUpdate={handleUpdate}
					onCancel={fermerFormulaire}
				/>
			</FenetreModale>

			<ModaleRefusConge
				conge={aRefuser}
				nomEmploye={aRefuser ? nomEmploye(aRefuser) : ''}
				onRefuser={refuser}
				onClose={() => setARefuser(null)}
			/>
		</>
	);
}
