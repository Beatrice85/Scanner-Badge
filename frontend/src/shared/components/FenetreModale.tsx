import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface FenetreModaleProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  closeOnBackdropClick?: boolean;
}

const SELECTEUR_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Boîte de dialogue modale accessible (WAI-ARIA « dialog (modal) ») :
// - role="dialog", aria-modal, titre relié par aria-labelledby ;
// - focus placé dans la fenêtre à l'ouverture, piégé (Tab / Maj+Tab), rendu à l'élément
//   déclencheur à la fermeture ; Échap ferme ;
// - défilement de la page bloqué pendant l'ouverture.
export default function FenetreModale({
  open,
  onClose,
  title,
  children,
  footer,
  className = '',
  contentClassName = '',
  closeOnBackdropClick = true,
}: FenetreModaleProps) {
  const idTitre = useId();
  const refFenetre = useRef<HTMLDivElement>(null);
  const refOnClose = useRef(onClose);
  refOnClose.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const declencheur = document.activeElement as HTMLElement | null;
    const debordementInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Premier champ du contenu, sinon la fenêtre elle-même.
    const fenetre = refFenetre.current;
    const premierChamp = fenetre?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
    (premierChamp ?? fenetre)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        refOnClose.current?.();
        return;
      }
      if (event.key !== 'Tab' || !refFenetre.current) {
        return;
      }
      const focusables = Array.from(refFenetre.current.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLE));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
        premier.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = debordementInitial;
      declencheur?.focus?.();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  // Portail vers <body> : la modale échappe à tout stacking context des parents
  // (transform, filter, overflow, backdrop-filter) et passe au-dessus de la carte Leaflet,
  // de la barre latérale (z-50) et de son fond mobile (z-40).
  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm ${className}`.trim()}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={refFenetre}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? idTitre : undefined}
        tabIndex={-1}
        className={`relative z-[10000] my-auto max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-carte border border-white/10 bg-slate-700 p-6 shadow-2xl ${contentClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>{title ? <h2 id={idTitre} className="text-lg font-semibold text-white">{title}</h2> : null}</div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg leading-none text-slate-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Fermer la fenêtre"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>

        <div className="text-sm leading-6 text-slate-200">{children}</div>

        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
