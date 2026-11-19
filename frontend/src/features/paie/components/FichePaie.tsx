import type { ResultatPaie } from '../types';
import BoutonExportPaie from './BoutonExportPaie';
import TableauPaie from './TableauPaie';

const formatDate = (date: string) => {
	const [annee, mois, jour] = date.slice(0, 10).split('-');
	return `${jour}/${mois}/${annee}`;
};

const formatHeures = (heures: number) =>
	`${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(heures)} h`;

const formatMontant = (montant: number) =>
	new Intl.NumberFormat('fr-MG', {
		style: 'currency',
		currency: 'MGA',
		currencyDisplay: 'narrowSymbol',
		maximumFractionDigits: 0,
	}).format(montant);

export default function FichePaie({ resultat }: { resultat: ResultatPaie }) {
	return (
		<section id="fiche-paie" className="rounded-carte border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
			<div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Fiche de paie calculée</p>
					<h2 className="mt-2 text-2xl font-semibold text-slate-900">
						{resultat.prenom} {resultat.nom}
					</h2>
					<p className="mt-1 text-sm text-slate-600">
						Période du {formatDate(resultat.periode.dateDebut)} au {formatDate(resultat.periode.dateFin)}
					</p>
				</div>
				<BoutonExportPaie resultat={resultat} />
			</div>

			<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-2xl bg-slate-50 p-4">
					<p className="text-sm text-slate-600">Heures travaillées</p>
					<p className="mt-1 text-xl font-semibold text-slate-900">{formatHeures(resultat.heuresTravaillees)}</p>
				</div>
				<div className="rounded-2xl bg-slate-50 p-4">
					<p className="text-sm text-slate-600">Congés payés</p>
					<p className="mt-1 text-xl font-semibold text-slate-900">{formatHeures(resultat.heuresCongesPayes)}</p>
					<p className="mt-1 text-xs text-slate-600">
						{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(resultat.joursCongesPayes)} jour(s)
					</p>
				</div>
				<div className="rounded-2xl bg-slate-50 p-4">
					<p className="text-sm text-slate-600">Heures supplémentaires</p>
					<p className="mt-1 text-xl font-semibold text-slate-900">{formatHeures(resultat.heuresSupplementaires)}</p>
				</div>
				<div className="rounded-2xl bg-slate-50 p-4">
					<p className="text-sm text-slate-600">Absences non justifiées</p>
					<p className="mt-1 text-xl font-semibold text-slate-900">{formatHeures(resultat.heuresAbsenceNonJustifiee)}</p>
				</div>
			</div>

			<div className="mt-6">
				<TableauPaie resultat={resultat} />
			</div>

			<div className="mt-5 flex flex-col gap-2 rounded-2xl bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-semibold text-slate-900">Total de la paie calculée</p>
					<p className="mt-1 text-sm text-slate-600">
						Taux horaire : {formatMontant(resultat.tauxHoraire)}
					</p>
				</div>
				<p className="text-2xl font-bold text-blue-800">{formatMontant(resultat.salaireTotal)}</p>
			</div>
			<p className="mt-4 text-xs text-slate-600">
				Ce document présente un calcul basé sur les données enregistrées. Il ne constitue pas un bulletin de paie officiel.
			</p>
		</section>
	);
}
