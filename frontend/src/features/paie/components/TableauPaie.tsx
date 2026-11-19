import type { ResultatPaie } from '../types';

const formatHeures = (heures: number) =>
	`${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(heures)} h`;

const formatMontant = (montant: number) =>
	new Intl.NumberFormat('fr-MG', {
		style: 'currency',
		currency: 'MGA',
		currencyDisplay: 'narrowSymbol',
		maximumFractionDigits: 0,
	}).format(montant);

export default function TableauPaie({ resultat }: { resultat: ResultatPaie }) {
	const lignes = [
		{
			libelle: 'Heures travaillées',
			base: formatHeures(resultat.heuresTravaillees),
			montant: formatMontant(resultat.salaireHeuresTravaillees),
		},
		{
			libelle: 'Congés payés',
			base: formatHeures(resultat.heuresCongesPayes),
			montant: formatMontant(resultat.salaireCongesPayes),
		},
		{
			libelle: 'Majoration des heures supplémentaires',
			base: formatHeures(resultat.heuresSupplementaires),
			montant: formatMontant(resultat.bonusHeuresSupplementaires),
		},
		{
			libelle: 'Retenue pour absences non justifiées',
			base: formatHeures(resultat.heuresAbsenceNonJustifiee),
			montant: `−${formatMontant(resultat.penalites)}`,
		},
	];

	return (
		<div className="overflow-x-auto rounded-2xl border border-slate-200">
			<table className="min-w-full divide-y divide-slate-200">
				<thead className="bg-slate-100">
					<tr>
						<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Élément</th>
						<th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Base</th>
						<th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Montant</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-200 bg-white">
					{lignes.map(ligne => (
						<tr key={ligne.libelle}>
							<td className="px-4 py-3 text-sm text-slate-800">{ligne.libelle}</td>
							<td className="px-4 py-3 text-sm text-slate-600">{ligne.base}</td>
							<td className="px-4 py-3 text-right text-sm font-medium text-slate-800">{ligne.montant}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
