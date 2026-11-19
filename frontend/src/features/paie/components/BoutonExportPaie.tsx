import type { ResultatPaie } from '../types';
import { notifierToast } from '../../../shared/lib/toast';

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

export default function BoutonExportPaie({ resultat }: { resultat: ResultatPaie }) {
	const exporterPdf = () => {
		const zone = document.getElementById('fiche-paie');
		if (!zone) return;

		const impression = window.open('', '_blank', 'width=900,height=1100');
		if (!impression) return;

		const contenu = `
			<!doctype html>
			<html lang="fr">
			<head>
				<meta charset="utf-8" />
				<title>Fiche de paie</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						color: #0f172a;
						margin: 32px;
						background: #ffffff;
					}
					* { box-sizing: border-box; }
					h1, h2, p { margin: 0; }
					.header {
						padding: 20px 24px;
						border: 1px solid #dbeafe;
						border-radius: 16px;
						background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
					}
					.kicker {
						font-size: 11px;
						letter-spacing: 0.18em;
						color: #1d4ed8;
						font-weight: 700;
						text-transform: uppercase;
					}
					.name {
						margin-top: 12px;
						font-size: 30px;
						font-weight: 700;
					}
					.period {
						margin-top: 8px;
						font-size: 14px;
						color: #475569;
					}
					.grid {
						display: grid;
						grid-template-columns: repeat(2, minmax(0, 1fr));
						gap: 12px;
						margin-top: 20px;
					}
					.card {
						background: #f8fafc;
						border: 1px solid #e2e8f0;
						border-radius: 14px;
						padding: 16px;
					}
					.label {
						font-size: 12px;
						color: #475569;
					}
					.value {
						margin-top: 8px;
						font-size: 22px;
						font-weight: 700;
					}
					.section { margin-top: 26px; }
					table {
						width: 100%;
						border-collapse: collapse;
						margin-top: 10px;
					}
					th, td {
						border-bottom: 1px solid #e2e8f0;
						padding: 11px 10px;
						text-align: left;
					}
					th {
						background: #f1f5f9;
						font-size: 11px;
						text-transform: uppercase;
						color: #334155;
					}
					.total {
						margin-top: 24px;
						padding: 18px 20px;
						border-top: 2px solid #bfdbfe;
						display: flex;
						justify-content: space-between;
						align-items: center;
						background: #f8fbff;
						border-radius: 14px;
					}
					.total-label { font-weight: 700; }
					.total-amount {
						font-size: 32px;
						font-weight: 700;
						color: #1d4ed8;
					}
					@media print { body { margin: 0; } }
				</style>
			</head>
			<body>
				<div class="header">
					<p class="kicker">Fiche de paie calculée</p>
					<h1 class="name">${resultat.prenom} ${resultat.nom}</h1>
					<p class="period">Période du ${formatDate(resultat.periode.dateDebut)} au ${formatDate(resultat.periode.dateFin)}</p>
				</div>

				<div class="grid">
					<div class="card"><p class="label">Heures travaillées</p><p class="value">${formatHeures(resultat.heuresTravaillees)}</p></div>
					<div class="card"><p class="label">Congés payés</p><p class="value">${formatHeures(resultat.heuresCongesPayes)}</p><p style="margin-top:6px; font-size:12px; color:#475569;">${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(resultat.joursCongesPayes)} jour(s)</p></div>
					<div class="card"><p class="label">Heures supplémentaires</p><p class="value">${formatHeures(resultat.heuresSupplementaires)}</p></div>
					<div class="card"><p class="label">Absences non justifiées</p><p class="value">${formatHeures(resultat.heuresAbsenceNonJustifiee)}</p></div>
				</div>

				<div class="section">
					<table>
						<thead>
							<tr>
								<th>Élément</th>
								<th>Base</th>
								<th style="text-align:right;">Montant</th>
							</tr>
						</thead>
						<tbody>
							<tr><td>Heures travaillées</td><td>${formatHeures(resultat.heuresTravaillees)}</td><td style="text-align:right;">${formatMontant(resultat.salaireHeuresTravaillees)}</td></tr>
							<tr><td>Congés payés</td><td>${formatHeures(resultat.heuresCongesPayes)}</td><td style="text-align:right;">${formatMontant(resultat.salaireCongesPayes)}</td></tr>
							<tr><td>Majoration des heures supplémentaires</td><td>${formatHeures(resultat.heuresSupplementaires)}</td><td style="text-align:right;">${formatMontant(resultat.bonusHeuresSupplementaires)}</td></tr>
							<tr><td>Retenue pour absences non justifiées</td><td>${formatHeures(resultat.heuresAbsenceNonJustifiee)}</td><td style="text-align:right;">−${formatMontant(resultat.penalites)}</td></tr>
						</tbody>
					</table>
				</div>

				<div class="total">
					<div>
						<p class="total-label">Total de la paie calculée</p>
						<p style="margin-top:6px; color:#475569;">Taux horaire : ${formatMontant(resultat.tauxHoraire)}</p>
					</div>
					<p class="total-amount">${formatMontant(resultat.salaireTotal)}</p>
				</div>
			</body>
			</html>
		`;

		impression.document.write(contenu);
		impression.document.close();
		impression.focus();
		impression.print();
		notifierToast('Fiche de paie envoyée à l’impression.');
	};

	return (
		<button
			type="button"
			onClick={exporterPdf}
			className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 print:hidden"
		>
			Exporter en PDF
		</button>
	);
}
