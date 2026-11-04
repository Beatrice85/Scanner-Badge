import type { StatutConge } from '../types';
import { LIBELLES_STATUT } from '../utils';

const CLASSES: Record<StatutConge, string> = {
	EN_ATTENTE: 'border-amber-300 bg-amber-50 text-amber-700',
	VALIDE: 'border-emerald-300 bg-emerald-50 text-emerald-700',
	REFUSE: 'border-rose-300 bg-rose-50 text-rose-700',
};

export default function BadgeStatutConge({ statut }: { statut: StatutConge }) {
	return (
		<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CLASSES[statut]}`}>
			{LIBELLES_STATUT[statut]}
		</span>
	);
}
