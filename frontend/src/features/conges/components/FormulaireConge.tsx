import React, { useEffect, useState } from 'react';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';
import type { Employee } from '../../employes/api/employes.api';
import { versChampDate } from '../../../shared/lib/formatage-date';

type Props = {
	// Fourni (vue ADMIN) : sélecteur d'employé. Absent (vue EMPLOYE) : pas de sélecteur,
	// le backend utilise l'employé du token.
	employes?: Employee[];
	edit?: Conge | null;
	// Employé présélectionné pour une nouvelle demande
	employeIdParDefaut?: string;
	onCreate: (payload: CreateCongePayload) => Promise<unknown>;
	onUpdate: (id: string, payload: UpdateCongePayload) => Promise<unknown>;
	onCancel?: () => void;
};

const champClasses = 'w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-60';

// Les règles métier (dates cohérentes, chevauchement, employé existant, droits) sont
// vérifiées par le backend : le formulaire affiche simplement son message d'erreur.
export default function FormulaireConge({ employes, edit, employeIdParDefaut = '', onCreate, onUpdate, onCancel }: Props) {
	const [employeId, setEmployeId] = useState('');
	const [dateDebut, setDateDebut] = useState('');
	const [dateFin, setDateFin] = useState('');
	const [motif, setMotif] = useState('');
	const [erreur, setErreur] = useState<string | null>(null);
	const [envoi, setEnvoi] = useState(false);

	const isEditing = Boolean(edit?.id);
	const avecSelecteurEmploye = Boolean(employes);

	useEffect(() => {
		setEmployeId(edit?.employeId ?? employeIdParDefaut);
		setDateDebut(versChampDate(edit?.dateDebut));
		setDateFin(versChampDate(edit?.dateFin));
		setMotif(edit?.motif ?? '');
		setErreur(null);
	}, [edit, employeIdParDefaut]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setErreur(null);
		setEnvoi(true);
		try {
			if (edit?.id) {
				// Motif toujours envoyé : un champ vidé efface le motif côté backend.
				await onUpdate(edit.id, { dateDebut, dateFin, motif });
			} else {
				await onCreate(avecSelecteurEmploye ? { employeId, dateDebut, dateFin, motif } : { dateDebut, dateFin, motif });
			}
		} catch (err: any) {
			setErreur(err?.message || 'Erreur lors de l\'enregistrement du congé');
		} finally {
			setEnvoi(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-white">{isEditing ? 'Modifier un congé' : 'Demande de congé'}</h3>
				<p className="mt-1 text-sm text-slate-400">
					{isEditing
						? 'Seuls les dates et le motif peuvent être modifiés.'
						: avecSelecteurEmploye
							? 'Choisissez l\'employé et la période du congé.'
							: 'Choisissez la période du congé. La demande sera envoyée pour validation.'}
				</p>
			</div>

			{erreur && (
				<div role="alert" className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
					{erreur}
				</div>
			)}

			<div className="space-y-3">
				{employes && (
					<div>
						<label htmlFor="conge-employe" className="mb-1 block text-sm font-medium text-slate-200">Employé</label>
						<select
							id="conge-employe"
							required
							disabled={isEditing}
							value={employeId}
							onChange={e => setEmployeId(e.target.value)}
							className={champClasses}
						>
							<option value="">Sélectionner un employé</option>
							{employes.map(emp => (
								<option key={String(emp.id)} value={String(emp.id)}>{`${emp.prenom} ${emp.nom}`.trim()}</option>
							))}
						</select>
					</div>
				)}
				<div>
					<label htmlFor="conge-debut" className="mb-1 block text-sm font-medium text-slate-200">Date de début</label>
					<input id="conge-debut" required type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className={champClasses} />
				</div>
				<div>
					<label htmlFor="conge-fin" className="mb-1 block text-sm font-medium text-slate-200">Date de fin</label>
					<input id="conge-fin" required type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className={champClasses} />
				</div>
				<div>
					<label htmlFor="conge-motif" className="mb-1 block text-sm font-medium text-slate-200">
						Motif <span className="font-normal text-slate-400">(facultatif)</span>
					</label>
					<textarea
						id="conge-motif"
						rows={3}
						value={motif}
						onChange={e => setMotif(e.target.value)}
						placeholder="Ex. : congé annuel, événement familial…"
						className={champClasses}
					/>
				</div>
			</div>

			<div className="mt-5 flex flex-wrap gap-3">
				{onCancel ? (
					<button type="button" onClick={onCancel} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
						Annuler
					</button>
				) : null}
				<button type="submit" disabled={envoi} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-60">
					{envoi ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : 'Envoyer la demande'}
				</button>
			</div>
		</form>
	);
}
