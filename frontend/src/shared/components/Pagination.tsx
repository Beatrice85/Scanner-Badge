import { useId } from 'react';
import { TAILLES_PAGE } from '../hooks/usePagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  premier: number;
  dernier: number;
  taille: number;
  onPageChange: (page: number) => void;
  onTailleChange: (taille: number) => void;
  // Nom des éléments au pluriel, pour les libellés (« 1–10 sur 57 chantiers »)
  libelle?: string;
  tailles?: readonly number[];
}

// Pages à afficher : toutes si ≤ 7, sinon 1 … autour de la page courante … dernière.
function pagesAffichees(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  if (page > 3) pages.push('ellipsis');
  for (let index = Math.max(2, page - 1); index <= Math.min(totalPages - 1, page + 1); index += 1) {
    pages.push(index);
  }
  if (page < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

const classeBouton =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

// Pagination accessible : sélecteur de lignes par page (libellé relié), position annoncée
// (aria-live), navigation <nav> avec page courante en aria-current et libellés explicites.
export default function Pagination({
  page,
  totalPages,
  total,
  premier,
  dernier,
  taille,
  onPageChange,
  onTailleChange,
  libelle = 'éléments',
  tailles = TAILLES_PAGE,
}: PaginationProps) {
  const idSelect = useId();

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor={idSelect} className="font-medium text-slate-700">Lignes par page</label>
          <select
            id={idSelect}
            value={taille}
            onChange={(event) => onTailleChange(Number(event.target.value))}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 hover:border-blue-400"
          >
            {tailles.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <p aria-live="polite">
          <span className="font-semibold text-slate-900">{premier}–{dernier}</span> sur{' '}
          <span className="font-semibold text-slate-900">{total}</span> {libelle}
        </p>
      </div>

      {totalPages > 1 && (
        <nav aria-label={`Pagination des ${libelle}`}>
          <ul className="flex flex-wrap items-center gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`${classeBouton} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`}
              >
                <span aria-hidden="true">‹</span>&nbsp;Précédent
              </button>
            </li>

            {pagesAffichees(page, totalPages).map((p, index) =>
              p === 'ellipsis' ? (
                <li key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-slate-500">…</li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => onPageChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    aria-label={`Page ${p}`}
                    className={`${classeBouton} ${
                      p === page
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                </li>
              ),
            )}

            <li>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`${classeBouton} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`}
              >
                Suivant&nbsp;<span aria-hidden="true">›</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
