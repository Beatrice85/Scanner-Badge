import React, { useState } from 'react';
import FenetreModale from '../../../shared/components/FenetreModale';
import { formaterDate } from '../../../shared/lib/formatage-date';
import type { Conge } from '../types';

type Props = {
	conge: Conge | null;
	nomEmploye: string;
	onRefuser: (id: string, motifRefus: string) => Promise<unknown>;
	onClose: () => void;
};

// Le motif est obligatoire : champ requis côté formulaire, règle vérifiée par le backend.
export default function ModaleRefusConge({ conge, nomEmploye, onRefuser, onClose }: Props) {
	const [motif, setMotif] = useState('');
	const [erreur, setErreur] = useState<string | null>(null);
	const [envoi, setEnvoi] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!conge) return;
		setErreur(null);
		setEnvoi(true);
		try {
			await onRefuser(conge.id, motif);
			onClose();
		} catch (err: any) {
			setErreur(err?.message || 'Erreur lors du refus du congé');
		} finally {
			setEnvoi(false);
		}
	}

	return (
		<FenetreModale open={Boolean(conge)} onClose={onClose} title="Refuser le congé">
			{conge && (
				<form onSubmit={handleSubmit}>
					<p className="mb-3 text-sm text-slate-300">
						Congé de <span className="font-semibold text-white">{nomEmploye}</span> du {formaterDate(conge.dateDebut)} au {formaterDate(conge.dateFin)}.
					</p>
					{conge.motif && (
						<p className="mb-3 whitespace-pre-line break-words text-sm text-slate-300">
							Motif de la demande : <span className="text-white">{conge.motif}</span>
						</p>
					)}

					{erreur && (
						<div role="alert" className="mb-3 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
							{erreur}
						</div>
					)}

					<label htmlFor="motif-refus" className="mb-1 block text-sm font-medium text-slate-200">Motif du refus (obligatoire)</label>
					<textarea
						id="motif-refus"
						required
						rows={3}
						value={motif}
						onChange={e => setMotif(e.target.value)}
						placeholder="Ex. : période de forte activité sur le chantier"
						className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-rose-400 focus:outline-none"
					/>

					<div className="mt-5 flex flex-wrap justify-end gap-3">
						<button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
							Annuler
						</button>
						<button type="submit" disabled={envoi} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60">
							{envoi ? 'Envoi...' : 'Refuser le congé'}
						</button>
					</div>
				</form>
			)}
		</FenetreModale>
	);
}
