// Squelette de chargement d'un tableau : reproduit la forme du tableau (en-tête + lignes)
// pour que la page ne « saute » pas à l'arrivée des données (perception de rapidité).
// Annoncé aux lecteurs d'écran par role="status" ; les barres animées sont décoratives.
const LARGEURS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-2/5'];

interface SqueletteTableauProps {
  colonnes: number;
  lignes?: number;
  libelle?: string;
}

export default function SqueletteTableau({ colonnes, lignes = 5, libelle = 'Chargement des données…' }: SqueletteTableauProps) {
  const grille = { gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` };

  return (
    <div role="status" aria-live="polite" className="overflow-hidden rounded-bloc border border-slate-200 bg-white">
      <span className="sr-only">{libelle}</span>
      <div aria-hidden="true">
        <div className="grid gap-4 bg-slate-100 px-4 py-3.5" style={grille}>
          {Array.from({ length: colonnes }, (_, c) => (
            <span key={c} className="h-3 w-2/3 rounded-full bg-slate-300/70" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: lignes }, (_, l) => (
            <div key={l} className="grid animate-pulse gap-4 px-4 py-4" style={grille}>
              {Array.from({ length: colonnes }, (_, c) => (
                <span key={c} className={`h-3 rounded-full bg-slate-200 ${LARGEURS[(l + c) % LARGEURS.length]}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
