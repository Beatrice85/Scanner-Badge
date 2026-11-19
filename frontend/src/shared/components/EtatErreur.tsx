// Erreur de chargement : message clair + moyen de s'en sortir (« Réessayer »),
// au lieu d'un tableau vide trompeur (« Aucun élément ») quand l'API n'a pas répondu.
interface EtatErreurProps {
  message: string;
  onReessayer?: () => void;
  titre?: string;
}

export default function EtatErreur({ message, onReessayer, titre = 'Impossible de charger les données' }: EtatErreurProps) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-bloc border border-rose-200 bg-rose-50 px-6 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </span>
      <p className="mt-4 text-base font-semibold text-rose-800">{titre}</p>
      <p className="mt-1 max-w-md text-sm text-rose-700">{message}</p>
      {onReessayer && (
        <button
          type="button"
          onClick={onReessayer}
          className="mt-5 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
