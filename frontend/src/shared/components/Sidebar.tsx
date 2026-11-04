import React, { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../../features/auth/context/auth-context';
import type { Role } from '../../features/auth/types';

// ---------------------------------------------------------------------------
// Icônes (SVG en ligne, trait 1.8, 20 px). Décoratives : aria-hidden, le libellé
// texte reste toujours affiché (reconnaissance plutôt que rappel).
// ---------------------------------------------------------------------------
type NomIcone = 'tableau' | 'chantier' | 'employe' | 'badge' | 'pointage' | 'conge' | 'utilisateurs' | 'sortie' | 'menu' | 'fermer' | 'marque';

const TRACES: Record<NomIcone, ReactNode> = {
  tableau: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  chantier: <><path d="M3 21h18" /><path d="M5 21V10l7-6 7 6v11" /><path d="M9 21v-6h6v6" /></>,
  employe: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18.5 14.8c1.6.8 2.6 2.6 3 5.2" /></>,
  badge: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><circle cx="12" cy="10" r="2.5" /><path d="M8 17c.6-1.8 2.1-2.8 4-2.8s3.4 1 4 2.8" /><path d="M10 6h4" /></>,
  pointage: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  conge: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></>,
  utilisateurs: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5" /><path d="M18.5 4.5 20 6l2.5-2.5" /></>,
  sortie: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 16l-4-4 4-4" /><path d="M6 12h10" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  fermer: <><path d="M6 6l12 12M18 6 6 18" /></>,
  marque: <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M8 12h8" /></>,
};

function Icone({ nom, className = 'h-5 w-5' }: { nom: NomIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      {TRACES[nom]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Navigation, regroupée par rubrique. roles : rôles qui voient le lien
// (le rôle vient du serveur via useAuth). Une rubrique sans lien visible est masquée.
// ---------------------------------------------------------------------------
type Lien = { to: string; label: string; labelEmploye?: string; icone: NomIcone; roles: Role[]; exact?: boolean };

const RUBRIQUES: { titre: string; titreEmploye?: string; liens: Lien[] }[] = [
  {
    titre: 'Général',
    titreEmploye: 'Mon espace',
    liens: [
      { to: '/admin', label: 'Tableau de bord', icone: 'tableau', roles: ['ADMIN'], exact: true },
      { to: '/conges', label: 'Congés', labelEmploye: 'Mes congés', icone: 'conge', roles: ['EMPLOYE'] },
    ],
  },
  {
    titre: 'Gestion',
    titreEmploye: 'Consultation',
    liens: [
      // EMPLOYE : lecture seule (voir TableauChantiers)
      { to: '/chantiers', label: 'Chantiers', icone: 'chantier', roles: ['ADMIN', 'EMPLOYE'] },
      { to: '/employes', label: 'Employés', icone: 'employe', roles: ['ADMIN'] },
      { to: '/badges', label: 'Badges', icone: 'badge', roles: ['ADMIN'] },
      { to: '/pointages', label: 'Pointages', icone: 'pointage', roles: ['ADMIN'] },
    ],
  },
  {
    titre: 'Ressources humaines',
    liens: [
      { to: '/conges', label: 'Congés', icone: 'conge', roles: ['ADMIN'] },
      // À réactiver quand la page et la route /paie seront créées côté frontend.
      // { to: '/paie', label: 'Paies', icone: 'paie', roles: ['ADMIN', 'EMPLOYE'] },
    ],
  },
  {
    titre: 'Administration',
    liens: [{ to: '/utilisateurs', label: 'Utilisateurs', icone: 'utilisateurs', roles: ['ADMIN'] }],
  },
];

const LIBELLE_ROLE: Record<Role, string> = { ADMIN: 'Administrateur', EMPLOYE: 'Employé' };

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  const lettres = mots.length > 1 ? mots[0][0] + mots[mots.length - 1][0] : (mots[0] ?? '?').slice(0, 2);
  return lettres.toUpperCase();
}

const ID_MENU = 'menu-principal';

// Navigation principale.
// - Grand écran (lg) : carte fixe à gauche, toute la hauteur (les pages décalent leur contenu avec lg:ml-80).
// - Petit écran : barre supérieure + panneau repliable (bouton avec aria-expanded), fermé
//   automatiquement après navigation, avec Échap ou en touchant le fond.
// - Page courante : fond bleu (couleur principale) et aria-current="page".
// - Lien d'évitement « Aller au contenu » vers <main id="contenu">.
export default function Sidebar() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const role = utilisateur?.role;
  const estEmploye = role === 'EMPLOYE';
  const accueil = role ? accueilDuRole(role) : '/';

  const rubriques = RUBRIQUES
    .map(r => ({ ...r, liens: r.liens.filter(l => role && l.roles.includes(role)) }))
    .filter(r => r.liens.length > 0);

  // Ferme le menu mobile après un changement de page.
  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOuvert) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOuvert(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOuvert]);

  function seDeconnecter() {
    deconnexion();
    navigate('/login', { replace: true });
  }

  const classeLien = ({ isActive }: { isActive: boolean }) =>
    [
      'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ');

  const marque = (
    <Link to={accueil} className="flex items-center gap-3 rounded-xl">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
        <Icone nom="marque" className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold tracking-tight text-slate-900">Scanner Badge</span>
        <span className="block truncate text-xs font-medium text-slate-500">
          {estEmploye ? 'Espace employé' : 'Administration'}
        </span>
      </span>
    </Link>
  );

  return (
    <>
      <a href="#contenu" className="lien-evitement">Aller au contenu</a>

      {/* Barre supérieure (petit écran) */}
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-md lg:hidden">
        {marque}
        <button
          type="button"
          onClick={() => setMenuOuvert(ouvert => !ouvert)}
          aria-expanded={menuOuvert}
          aria-controls={ID_MENU}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Icone nom={menuOuvert ? 'fermer' : 'menu'} />
          {menuOuvert ? 'Fermer' : 'Menu'}
        </button>
      </div>

      {/* Fond assombri derrière le panneau mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden" aria-hidden="true" onClick={() => setMenuOuvert(false)} />
      )}

      <aside
        id={ID_MENU}
        aria-label="Navigation principale"
        className={[
          'z-50 flex-col border-slate-200 bg-white shadow-xl',
          // Petit écran : panneau latéral affiché seulement si le menu est ouvert.
          menuOuvert ? 'fixed inset-y-0 left-0 flex w-[85vw] max-w-[18rem] rounded-r-[28px] border' : 'hidden',
          // Grand écran : carte fixe, détachée des bords (cohérente avec les cartes des pages).
          'lg:fixed lg:inset-y-4 lg:left-4 lg:flex lg:w-72 lg:max-w-none lg:rounded-[28px] lg:border',
        ].join(' ')}
      >
        <div className="border-b border-slate-200 px-5 py-5">{marque}</div>

        <nav aria-label="Pages" className="flex-1 overflow-y-auto px-3 py-4">
          {rubriques.map((rubrique) => {
            const titre = estEmploye && rubrique.titreEmploye ? rubrique.titreEmploye : rubrique.titre;
            const idTitre = `rubrique-${titre.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <div key={rubrique.titre} className="mb-5 last:mb-0">
                <p id={idTitre} className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {titre}
                </p>
                <ul aria-labelledby={idTitre} className="space-y-1">
                  {rubrique.liens.map((lien) => (
                    <li key={`${lien.to}-${lien.label}`}>
                      <NavLink to={lien.to} end={lien.exact} className={classeLien}>
                        <Icone nom={lien.icone} />
                        <span className="truncate">{estEmploye && lien.labelEmploye ? lien.labelEmploye : lien.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {utilisateur && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
                aria-hidden="true"
              >
                {initiales(utilisateur.nom)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{utilisateur.nom}</p>
                <p className="truncate text-xs text-slate-600" title={utilisateur.email}>{utilisateur.email}</p>
              </div>
              <span className="shrink-0 rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                {LIBELLE_ROLE[utilisateur.role]}
              </span>
            </div>
            <button
              type="button"
              onClick={seDeconnecter}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <Icone nom="sortie" />
              Se déconnecter
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
