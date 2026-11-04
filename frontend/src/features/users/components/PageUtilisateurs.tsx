import { useMemo, useState } from 'react';
import Sidebar from '../../../shared/components/Sidebar';
import { useAuth } from '../../auth/context/auth-context';
import type { Role } from '../../auth/types';
import useEmployes from '../../employes/hooks/useEmployes';
import useUtilisateurs from '../hooks/useUtilisateurs';
import type { CompteUtilisateur } from '../types';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';

const LIBELLES_ROLE: Record<Role, string> = { ADMIN: 'Administrateur', EMPLOYE: 'Employé' };

const CLASSES_ROLE: Record<Role, string> = {
	ADMIN: 'border-blue-300 bg-blue-50 text-blue-700',
	EMPLOYE: 'border-slate-300 bg-slate-50 text-slate-700',
};

// Page ADMIN : liste des comptes et changement de rôle.
// Les règles (pas son propre rôle, pas le dernier ADMIN) sont vérifiées par le backend.
export default function PageUtilisateurs() {
	const { utilisateur: moi } = useAuth();
	const { utilisateurs, loading, error, changerRole } = useUtilisateurs();
	const pagination = usePagination(utilisateurs);
	const { employes } = useEmployes();

	const [enCours, setEnCours] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [succes, setSucces] = useState<string | null>(null);

	const nomsEmployes = useMemo(() => {
		const map: Record<string, string> = {};
		employes.forEach(e => {
			map[String(e.id)] = `${e.prenom} ${e.nom}`.trim();
		});
		return map;
	}, [employes]);

	async function handleChangerRole(compte: CompteUtilisateur) {
		const nouveauRole: Role = compte.role === 'ADMIN' ? 'EMPLOYE' : 'ADMIN';
		const confirmed = window.confirm(
			`Passer ${compte.nom} (${compte.email}) au rôle « ${LIBELLES_ROLE[nouveauRole]} » ?`,
		);
		if (!confirmed) return;

		setActionError(null);
		setSucces(null);
		setEnCours(compte.id);
		try {
			await changerRole(compte.id, nouveauRole);
			setSucces(
				`${compte.nom} est maintenant ${LIBELLES_ROLE[nouveauRole].toLowerCase()}. ` +
					'Ce compte devra se reconnecter pour que le changement soit pris en compte.',
			);
		} catch (err: any) {
			setActionError(err?.message || 'Erreur lors du changement de rôle');
		} finally {
			setEnCours(null);
		}
	}

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 space-y-6">
					<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">Utilisateurs</h1>
						<p className="mt-1 text-sm text-slate-500">
							Comptes de connexion et leur rôle (choisi à l'inscription, modifiable ici).
						</p>
					</div>

					{succes && (
						<div role="status" className="rounded-[22px] border border-emerald-300 bg-emerald-50 p-4 text-emerald-800">
							{succes}
						</div>
					)}

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
												<td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Aucun compte.</td>
											</tr>
										) : pagination.elementsPage.map(u => {
											const estMoi = u.id === moi?.id;
											return (
												<tr key={u.id} className="hover:bg-slate-50">
													<td className="px-4 py-3 text-sm text-slate-700">
														{u.nom}
														{estMoi && <span className="ml-2 text-xs text-slate-500">(vous)</span>}
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
														<button
															type="button"
															disabled={estMoi || enCours === u.id}
															title={estMoi ? 'Vous ne pouvez pas modifier votre propre rôle' : undefined}
															onClick={() => handleChangerRole(u)}
															className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
														>
															{u.role === 'ADMIN' ? 'Passer employé' : 'Passer administrateur'}
														</button>
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
		</div>
	);
}
