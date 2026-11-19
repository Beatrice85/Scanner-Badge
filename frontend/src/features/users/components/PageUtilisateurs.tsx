import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../shared/components/Sidebar';
import { useAuth } from '../../auth/context/auth-context';
import type { Role } from '../../auth/types';
import useEmployes from '../../employes/hooks/useEmployes';
import useUtilisateurs from '../hooks/useUtilisateurs';
import type { CompteUtilisateur } from '../types';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import FenetreModale from '../../../shared/components/FenetreModale';
import type { Employee } from '../../employes/api/employes.api';
import SqueletteTableau from '../../../shared/components/SqueletteTableau';
import EtatVide from '../../../shared/components/EtatVide';
import EtatErreur from '../../../shared/components/EtatErreur';
import useConfirmation from '../../../shared/hooks/useConfirmation';

const LIBELLES_ROLE: Record<Role, string> = { ADMIN: 'Administrateur', EMPLOYE: 'Employé' };

const CLASSES_ROLE: Record<Role, string> = {
	ADMIN: 'border-blue-300 bg-blue-50 text-blue-700',
	EMPLOYE: 'border-slate-300 bg-slate-50 text-slate-700',
};

// Page ADMIN : liste des comptes et changement de rôle.
// Les règles (pas son propre rôle, pas le dernier ADMIN) sont vérifiées par le backend.
export default function PageUtilisateurs() {
	const { utilisateur: moi } = useAuth();
	const { utilisateurs, loading, error, fetchAll, changerRole, associerEmploye } = useUtilisateurs();
	const pagination = usePagination(utilisateurs);
	const { confirmer, fenetreConfirmation } = useConfirmation();
	const { employes } = useEmployes();

	const [enCours, setEnCours] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [compteAAssocier, setCompteAAssocier] = useState<CompteUtilisateur | null>(null);
	const [employeIdSelectionne, setEmployeIdSelectionne] = useState('');
	const [associationEnCours, setAssociationEnCours] = useState(false);
	const [associationErreur, setAssociationErreur] = useState<string | null>(null);

	const nomsEmployes = useMemo(() => {
		const map: Record<string, string> = {};
		employes.forEach(e => {
			map[String(e.id)] = `${e.prenom} ${e.nom}`.trim();
		});
		return map;
	}, [employes]);

	const employesDisponibles = useMemo(() => {
		const idsLies = new Set(
			utilisateurs
				.map(compte => compte.employeId)
				.filter((id): id is string => id !== null),
		);
		return employes.filter(
			(employe): employe is Employee & { id: string | number } =>
				employe.id !== undefined && !idsLies.has(String(employe.id)),
		);
	}, [employes, utilisateurs]);

	function ouvrirAssociation(compte: CompteUtilisateur) {
		setCompteAAssocier(compte);
		setEmployeIdSelectionne('');
		setAssociationErreur(null);
	}

	async function handleAssocierEmploye(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!compteAAssocier || !employeIdSelectionne) return;

		setAssociationErreur(null);
		setAssociationEnCours(true);
		try {
			await associerEmploye(compteAAssocier.id, employeIdSelectionne);
			setCompteAAssocier(null);
			setEmployeIdSelectionne('');
		} catch (err) {
			setAssociationErreur(err instanceof Error ? err.message : "Erreur lors de l'association de la fiche employé.");
		} finally {
			setAssociationEnCours(false);
		}
	}

	async function handleChangerRole(compte: CompteUtilisateur) {
		const nouveauRole: Role = compte.role === 'ADMIN' ? 'EMPLOYE' : 'ADMIN';
		const confirmed = await confirmer({
			titre: 'Changer le rôle ?',
			message: <><strong className="text-white">{compte.nom}</strong> ({compte.email}) passera au rôle « {LIBELLES_ROLE[nouveauRole]} ».</>,
			libelleConfirmer: 'Changer le rôle',
		});
		if (!confirmed) return;

		setActionError(null);
		setEnCours(compte.id);
		try {
			await changerRole(compte.id, nouveauRole);
		} catch (err: any) {
			setActionError(err?.message || 'Erreur lors du changement de rôle');
		} finally {
			setEnCours(null);
		}
	}

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 space-y-6">
					<div className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">Utilisateurs</h1>
						<p className="mt-1 text-sm text-slate-500">
							Comptes de connexion et leur rôle (choisi à l'inscription, modifiable ici).
						</p>
					</div>

					{actionError && (
						<div role="alert" className="rounded-bloc border border-rose-300 bg-rose-50 p-4 text-rose-700">
							{actionError}
						</div>
					)}

					<div className="rounded-carte border border-slate-200 bg-white p-4 shadow-xl">
						{loading ? (
							<SqueletteTableau colonnes={5} libelle="Chargement des comptes…" />
						) : error ? (
							<EtatErreur message={error} onReessayer={fetchAll} />
						) : (
							<>
							<div className="overflow-x-auto rounded-bloc border border-slate-200 bg-white shadow-lg">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-100">
										<tr>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nom</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rôle</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Fiche employé</th>
											<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{utilisateurs.length === 0 ? (
											<tr>
												<td colSpan={5}>
													<EtatVide titre="Aucun compte" description="Les comptes créés à l’inscription apparaîtront ici." />
												</td>
											</tr>
										) : pagination.elementsPage.map(u => {
											const estMoi = u.id === moi?.id;
											const photoProfil = u.photoUrl ?? null;
											const initiales = u.nom.trim().split(/\s+/).filter(Boolean);
											const avatarInitiales = (initiales.length > 1
												? initiales[0][0] + initiales[initiales.length - 1][0]
												: (initiales[0] ?? '?').slice(0, 2)
											).toUpperCase();
											return (
												<tr key={u.id} className="hover:bg-slate-50">
													<td className="px-4 py-3 text-sm text-slate-700">
														<div className="flex items-center gap-3">
															<Link
																to={`/utilisateurs/${u.id}`}
																aria-label={`Voir le profil de ${u.nom}`}
																className="shrink-0 rounded-full"
															>
																{photoProfil ? (
																	<img src={photoProfil} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200" />
																) : (
																	<span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-1 ring-slate-200">
																		{avatarInitiales}
																	</span>
																)}
															</Link>
															<span>
																{u.nom}
																{estMoi && <span className="ml-2 text-xs text-slate-500">(vous)</span>}
															</span>
														</div>
													</td>
													<td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
													<td className="px-4 py-3 text-sm">
														<span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CLASSES_ROLE[u.role]}`}>
															{LIBELLES_ROLE[u.role]}
														</span>
													</td>
													<td className="px-4 py-3 text-sm text-slate-500">
														{u.employeId ? nomsEmployes[u.employeId] || u.employeId : <span className="text-slate-500">Non liée</span>}
													</td>
													<td className="px-4 py-3 text-sm">
														<div className="flex flex-wrap gap-2">
															{!u.employeId && (
																<button
																	type="button"
																	disabled={associationEnCours || enCours === u.id}
																	onClick={() => ouvrirAssociation(u)}
																	className="rounded-full border border-blue-300 px-3 py-1 font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	Lier une fiche
																</button>
															)}
															<button
																type="button"
																disabled={estMoi || enCours === u.id || associationEnCours}
																title={estMoi ? 'Vous ne pouvez pas modifier votre propre rôle' : undefined}
																onClick={() => handleChangerRole(u)}
																className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
															>
																{u.role === 'ADMIN' ? 'Passer employé' : 'Passer administrateur'}
															</button>
														</div>
													</td>
												</tr>
											);
										})}
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
								libelle="comptes"
							/>
							</>
						)}
					</div>
				</main>
			</div>
			{fenetreConfirmation}
			<FenetreModale
				open={compteAAssocier !== null}
				onClose={() => {
					if (!associationEnCours) setCompteAAssocier(null);
				}}
				title="Associer une fiche employé"
				footer={
					<>
						<button
							type="button"
							disabled={associationEnCours}
							onClick={() => setCompteAAssocier(null)}
							className="min-h-11 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
						>
							Annuler
						</button>
						<button
							type="submit"
							form="form-association-employe"
							disabled={associationEnCours || employesDisponibles.length === 0}
							className="min-h-11 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{associationEnCours ? 'Association…' : 'Associer'}
						</button>
					</>
				}
			>
				{compteAAssocier && (
					<form id="form-association-employe" onSubmit={handleAssocierEmploye} className="space-y-4">
						<p>
							Compte : <span className="font-semibold text-white">{compteAAssocier.nom}</span>
						</p>
						<div>
							<label htmlFor="association-employe" className="mb-1 block font-medium text-slate-100">
								Fiche employé
							</label>
							<select
								id="association-employe"
								required
								value={employeIdSelectionne}
								onChange={event => setEmployeIdSelectionne(event.target.value)}
								disabled={associationEnCours || employesDisponibles.length === 0}
								className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
							>
								<option value="">
									{employesDisponibles.length ? 'Sélectionner un employé' : 'Aucune fiche employé disponible'}
								</option>
								{employesDisponibles.map(employe => (
									<option key={String(employe.id)} value={String(employe.id)}>
										{employe.prenom} {employe.nom} — {employe.id}
									</option>
								))}
							</select>
						</div>
						{associationErreur && (
							<p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-800">
								{associationErreur}
							</p>
						)}
					</form>
				)}
			</FenetreModale>
		</div>
	);
}
