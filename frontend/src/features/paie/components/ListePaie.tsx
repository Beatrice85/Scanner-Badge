import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/context/auth-context';
import type { Utilisateur } from '../../auth/types';
import useEmployes from '../../employes/hooks/useEmployes';
import type { Employee } from '../../employes/api/employes.api';
import Sidebar from '../../../shared/components/Sidebar';
import usePaie from '../hooks/usePaie';
import type { ResultatPaie } from '../types';
import FichePaie from './FichePaie';

function periodeCourante() {
	const aujourdHui = new Date();
	const annee = aujourdHui.getFullYear();
	const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');
	const dernierJour = String(new Date(annee, aujourdHui.getMonth() + 1, 0).getDate()).padStart(2, '0');

	return {
		dateDebut: `${annee}-${mois}-01`,
		dateFin: `${annee}-${mois}-${dernierJour}`,
	};
}

function dateCorrespondante(dateResultat: string, dateChamp: string) {
	return dateResultat.slice(0, 10) === dateChamp;
}

function CalculateurPaie({
	utilisateur,
	employes,
	chargementEmployes = false,
	erreurEmployes = null,
}: {
	utilisateur: Utilisateur;
	employes?: Employee[];
	chargementEmployes?: boolean;
	erreurEmployes?: string | null;
}) {
	const { resultat, loading, error, calculer } = usePaie();
	const [employeIdSelectionne, setEmployeIdSelectionne] = useState('');
	const [periode, setPeriode] = useState(periodeCourante);
	const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null);

	const estAdmin = utilisateur.role === 'ADMIN';
	const employeId = estAdmin ? employeIdSelectionne : utilisateur.employeId ?? '';
	const resultatCourant: ResultatPaie | null =
		resultat &&
		resultat.employeId === employeId &&
		dateCorrespondante(resultat.periode.dateDebut, periode.dateDebut) &&
		dateCorrespondante(resultat.periode.dateFin, periode.dateFin)
			? resultat
			: null;

	async function soumettre(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErreurFormulaire(null);

		if (!employeId) {
			setErreurFormulaire('Sélectionnez un employé avant de calculer sa fiche de paie.');
			return;
		}

		if (periode.dateDebut > periode.dateFin) {
			setErreurFormulaire('La date de début doit être antérieure ou égale à la date de fin.');
			return;
		}

		await calculer(employeId, periode.dateDebut, periode.dateFin);
	}

	if (!estAdmin && !employeId) {
		return (
			<div role="alert" className="rounded-[22px] border border-amber-300 bg-amber-50 p-4 text-amber-900">
				Votre compte n'est associé à aucun employé. Contactez un administrateur pour consulter votre fiche de paie.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xl print:hidden">
				<h2 className="text-lg font-semibold text-slate-900">Calculer une fiche de paie</h2>
				<p className="mt-1 text-sm text-slate-600">
					{estAdmin
						? 'Choisissez un employé et une période pour consulter son calcul de paie.'
						: 'Choisissez une période pour consulter votre calcul de paie.'}
				</p>

				{erreurEmployes && (
					<p role="alert" className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
						{erreurEmployes}
					</p>
				)}

				<form onSubmit={soumettre} className="mt-5 grid gap-4 md:grid-cols-2">
					{estAdmin && (
						<div className="md:col-span-2">
							<label htmlFor="paie-employe" className="mb-1 block text-sm font-medium text-slate-700">
								Employé
							</label>
							<select
								id="paie-employe"
								required
								value={employeIdSelectionne}
								onChange={event => setEmployeIdSelectionne(event.target.value)}
								disabled={chargementEmployes || !employes?.length}
								className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
							>
								<option value="">
									{chargementEmployes
										? 'Chargement des employés…'
										: employes?.length
											? 'Sélectionner un employé'
											: 'Aucun employé disponible'}
								</option>
								{employes?.map(employe => (
									<option key={String(employe.id)} value={String(employe.id)}>
										{employe.prenom} {employe.nom}
									</option>
								))}
							</select>
						</div>
					)}
					<div>
						<label htmlFor="paie-date-debut" className="mb-1 block text-sm font-medium text-slate-700">
							Début de période
						</label>
						<input
							id="paie-date-debut"
							required
							type="date"
							value={periode.dateDebut}
							onChange={event => setPeriode(current => ({ ...current, dateDebut: event.target.value }))}
							className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
						/>
					</div>
					<div>
						<label htmlFor="paie-date-fin" className="mb-1 block text-sm font-medium text-slate-700">
							Fin de période
						</label>
						<input
							id="paie-date-fin"
							required
							type="date"
							value={periode.dateFin}
							onChange={event => setPeriode(current => ({ ...current, dateFin: event.target.value }))}
							className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
						/>
					</div>

					{(erreurFormulaire || error) && (
						<p role="alert" className="md:col-span-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
							{erreurFormulaire || error}
						</p>
					)}

					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={loading || chargementEmployes || !employeId}
							className="min-h-11 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loading ? 'Calcul en cours…' : 'Calculer la fiche de paie'}
						</button>
					</div>
				</form>
			</section>

			{loading && (
				<p role="status" aria-live="polite" className="rounded-xl bg-white p-4 text-center text-slate-600">
					Calcul de la fiche de paie…
				</p>
			)}
			{resultatCourant && !loading && <FichePaie resultat={resultatCourant} />}
		</div>
	);
}

function PaieAdmin({ utilisateur }: { utilisateur: Utilisateur }) {
	const { employes, loading, error } = useEmployes();
	return (
		<CalculateurPaie
			utilisateur={utilisateur}
			employes={employes}
			chargementEmployes={loading}
			erreurEmployes={error}
		/>
	);
}

export default function ListePaie() {
	const { utilisateur } = useAuth();

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8 print:bg-white print:p-0">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24 print:pt-0">
				<div className="print:hidden">
					<Sidebar />
				</div>
				<main id="contenu" tabIndex={-1} className="min-w-0 flex-1 space-y-6 focus:outline-none lg:ml-80 print:ml-0">
					<header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Ressources humaines</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">
							{utilisateur?.role === 'EMPLOYE' ? 'Ma fiche de paie' : 'Gestion de la paie'}
						</h1>
						<p className="mt-2 text-sm text-slate-600">
							Consultez le détail des heures, des congés payés, des majorations et des retenues.
						</p>
					</header>

					{utilisateur?.role === 'ADMIN' ? (
						<PaieAdmin utilisateur={utilisateur} />
					) : utilisateur ? (
						<CalculateurPaie utilisateur={utilisateur} />
					) : null}
				</main>
			</div>
		</div>
	);
}
