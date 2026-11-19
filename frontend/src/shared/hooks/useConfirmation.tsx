import { useCallback, useRef, useState, type ReactNode } from 'react';
import FenetreModale from '../components/FenetreModale';

export type OptionsConfirmation = {
	titre: string;
	message: ReactNode;
	libelleConfirmer?: string;
	libelleAnnuler?: string;
	// Action destructrice (suppression…) : bouton rouge
	danger?: boolean;
};

type Demande = OptionsConfirmation & { resoudre: (ok: boolean) => void };

// Remplace window.confirm par une fenêtre accessible et cohérente avec l'application.
//   const { confirmer, fenetreConfirmation } = useConfirmation();
//   if (!(await confirmer({ titre: 'Supprimer le chantier ?', message: '…', danger: true }))) return;
//   …et rendre {fenetreConfirmation} dans le JSX de la page.
// Échap, clic sur le fond ou « Annuler » : la promesse renvoie false.
export default function useConfirmation() {
	const [demande, setDemande] = useState<Demande | null>(null);
	const refDemande = useRef<Demande | null>(null);

	const confirmer = useCallback(
		(options: OptionsConfirmation) =>
			new Promise<boolean>((resoudre) => {
				// Une demande déjà ouverte est considérée comme annulée.
				refDemande.current?.resoudre(false);
				const nouvelle = { ...options, resoudre };
				refDemande.current = nouvelle;
				setDemande(nouvelle);
			}),
		[],
	);

	const fermer = useCallback((ok: boolean) => {
		refDemande.current?.resoudre(ok);
		refDemande.current = null;
		setDemande(null);
	}, []);

	const fenetreConfirmation = (
		<FenetreModale open={Boolean(demande)} onClose={() => fermer(false)} title={demande?.titre}>
			{demande && (
				<>
					<div className="text-slate-200">{demande.message}</div>
					<div className="mt-6 flex flex-wrap justify-end gap-3">
						<button
							type="button"
							onClick={() => fermer(false)}
							className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
						>
							{demande.libelleAnnuler ?? 'Annuler'}
						</button>
						<button
							type="button"
							onClick={() => fermer(true)}
							className={`rounded-full px-4 py-2 text-sm font-medium text-white transition ${
								demande.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
							}`}
						>
							{demande.libelleConfirmer ?? 'Confirmer'}
						</button>
					</div>
				</>
			)}
		</FenetreModale>
	);

	return { confirmer, fenetreConfirmation };
}
