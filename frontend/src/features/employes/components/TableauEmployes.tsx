import React from 'react';
import FenetreModale from '../../../shared/components/FenetreModale';
import FormulaireEmploye from './FormulaireEmploye';
import Sidebar from '../../../shared/components/Sidebar';
import useEmployes from '../hooks/useEmployes';
import chantiersApi, { Chantier } from '../../../features/chantiers/api/chantiers.api';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import SqueletteTableau from '../../../shared/components/SqueletteTableau';
import EtatVide from '../../../shared/components/EtatVide';
import EtatErreur from '../../../shared/components/EtatErreur';

export default function TableauEmployes() {
	const { employes, loading, error, fetchAll, create, update, remove } = useEmployes();
	// Indicateurs calculés à partir de la liste (aucune valeur en dur)
	const avecBadge = employes.filter(e => Boolean(e.badge?.uid || e.badgeId)).length;
	const sansChantier = employes.filter(e => !e.chantierId).length;
	const pagination = usePagination(employes);
	const [chantiers, setChantiers] = React.useState<Chantier[]>([]);
	const [chantierMap, setChantierMap] = React.useState<Record<string, string>>({});

	React.useEffect(() => {
		chantiersApi.list().then(data => {
			setChantiers(data || []);
			const map: Record<string, string> = {};
			(data || []).forEach(c => {
				map[String(c.id)] = c.nom;
			});
			setChantierMap(map);
		});
	}, []);
	const [editing, setEditing] = React.useState<any>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);

	function openModal(employee: any | null = null) {
		setEditing(employee);
		setIsModalOpen(true);
	}

	function closeModal() {
		setEditing(null);
		setIsModalOpen(false);
	}

	async function addOrUpdateEmployee(employee: any) {
		if (employee.id) {
			await update(employee.id, employee);
		} else {
			await create(employee);
		}
		closeModal();
	}

	async function handleDelete(id: string | number, name: string) {
		const confirmed = window.confirm(`Supprimer ${name} ?`);
		if (!confirmed) return;
		await remove(id);
	}

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 space-y-6">
					<div className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
								<h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestion des employés</h1>
								<p className="mt-1 text-sm text-slate-500">Liste, ajout, modification et suppression des employés.</p>
							</div>
							<button
								type="button"
								className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
								onClick={() => openModal(null)}
							>
								+ Ajouter un employé
							</button>
						</div>
					</div>


					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-bloc border border-slate-200 bg-slate-50 p-4 shadow-sm">
							<p className="text-sm text-slate-500">Employés</p>
							<p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '—' : employes.length}</p>
						</div>
						<div className="rounded-bloc border border-slate-200 bg-slate-50 p-4 shadow-sm">
							<p className="text-sm text-slate-500">Avec badge</p>
							<p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '—' : avecBadge}</p>
						</div>
						<div className="rounded-bloc border border-slate-200 bg-slate-50 p-4 shadow-sm">
							<p className="text-sm text-slate-500">Sans chantier</p>
							<p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '—' : sansChantier}</p>
							{!loading && sansChantier > 0 && (
								<p className="mt-1 text-xs text-amber-700">Pointages impossibles tant qu'un chantier n'est pas affecté.</p>
							)}
						</div>
					</div>

					<div className="rounded-carte border border-slate-200 bg-white p-4 shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">Liste des employés</h3>
								<p className="text-sm text-slate-500">Consultez, modifiez ou supprimez un employé en un clic.</p>
							</div>
						
						</div>

						{loading ? (
							<SqueletteTableau colonnes={7} libelle="Chargement des employés…" />
						) : error ? (
							<EtatErreur message={error} onReessayer={fetchAll} />
						) : (
							<>
							<div className="overflow-x-auto rounded-bloc border border-slate-200 bg-white shadow-lg">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-100">
										<tr>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nom</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Prénom</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Badge UID</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Taux Horaire</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Volume Mensuel</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nom Chantier</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{employes.length === 0 ? (
											<tr>
												<td colSpan={7}>
													<EtatVide
														titre="Aucun employé pour le moment"
														description="Ajoutez un employé, ou laissez-les s’inscrire : leur fiche est alors créée automatiquement."
														action={{ libelle: '+ Ajouter un employé', onClick: () => openModal(null) }}
													/>
												</td>
											</tr>
										) : pagination.elementsPage.map(e => (
											<tr key={String(e.id)} className="hover:bg-slate-50">
												<td className="px-4 py-3 text-sm text-slate-700">{e.nom}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{e.prenom}</td>
												<td className="px-4 py-3 text-sm text-slate-500">{e.badge?.uid || e.badgeId || '—'}</td>
												<td className="px-4 py-3 text-sm text-slate-500">{e.tauxHoraire ?? '—'}</td>
												<td className="px-4 py-3 text-sm text-slate-500">{e.volumeMensuelObligatoire ?? '—'}</td>
												<td className="px-4 py-3 text-sm text-slate-500">{(e.chantierId && chantierMap[e.chantierId]) || e.chantierId || 'Non affecté'}</td>
												<td className="px-4 py-3 text-sm">
													<button className="mr-2 rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100" onClick={() => openModal(e)}>Éditer</button>
													<button className="rounded-full border border-rose-300 px-3 py-1 font-medium text-rose-600 transition hover:bg-rose-50" onClick={() => handleDelete(e.id!, `${e.prenom} ${e.nom}`.trim())}>Supprimer</button>
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
								libelle="employés"
							/>
							</>
						)}
					</div>
				</main>
			</div>

			<FenetreModale open={isModalOpen} onClose={closeModal} title={editing?.id ? 'Modifier un employé' : 'Ajouter un employé'}>
				<FormulaireEmploye edit={editing} onSubmit={addOrUpdateEmployee} onCancel={closeModal} />
			</FenetreModale>
		</div>
	);
}