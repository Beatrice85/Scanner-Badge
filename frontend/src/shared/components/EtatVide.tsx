import type { ReactNode } from 'react';

// État vide : explique pourquoi il n'y a rien et propose l'action suivante
// (plutôt qu'un simple « Aucune donnée »).
interface EtatVideProps {
  titre: string;
  description?: string;
  // Bouton d'action principal (ex. « Ajouter un chantier »), absent si l'utilisateur n'a rien à faire
  action?: { libelle: string; onClick: () => void };
  // Ton positif (tout est traité) : coche verte au lieu de l'icône neutre
  positif?: boolean;
  icone?: ReactNode;
}

function IconeNeutre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d="M3 13h5l1.5 2.5h5L16 13h5" />
      <path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-8Z" />
    </svg>
  );
}

function IconePositive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function EtatVide({ titre, description, action, positif = false, icone }: EtatVideProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          positif ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
        }`}
      >
        {icone ?? (positif ? <IconePositive /> : <IconeNeutre />)}
      </span>
      <p className="mt-4 text-base font-semibold text-slate-900">{titre}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {action.libelle}
        </button>
      )}
    </div>
  );
}
