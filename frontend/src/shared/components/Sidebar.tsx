import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../../features/auth/context/auth-context';
import type { Role } from '../../features/auth/types';

// roles : rôles qui voient le lien (le rôle vient du serveur via useAuth).
const liens: { to: string; label: string; roles: Role[] }[] = [
  { to: '/chantiers', label: 'Chantiers', roles: ['ADMIN', 'EMPLOYE'] }, // EMPLOYE : lecture seule
  { to: '/employes', label: 'Employés', roles: ['ADMIN'] },
  { to: '/badges', label: 'Badges', roles: ['ADMIN'] },
  { to: '/pointages', label: 'Pointages', roles: ['ADMIN'] },
  { to: '/conges', label: 'Congés', roles: ['ADMIN', 'EMPLOYE'] },
  { to: '/utilisateurs', label: 'Utilisateurs', roles: ['ADMIN'] },
  // À réactiver quand la page et la route /paie seront créées côté frontend.
  // { to: '/paie', label: 'Paies', roles: ['ADMIN', 'EMPLOYE'] },
];

export default function Sidebar() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const role = utilisateur?.role;
  const liensVisibles = liens.filter(lien => role && lien.roles.includes(role));

  function seDeconnecter() {
    deconnexion();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-full max-w-xs flex-col items-center rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          {role === 'ADMIN' ? 'Admin' : 'Espace employé'}
        </p>
        <Link to={role ? accueilDuRole(role) : '/'} className="hover:opacity-80 transition">
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{role === 'ADMIN' ? 'Dashboard' : 'Mon espace'}</h2>
        </Link>
      </div>

      <nav className="mt-6 w-full space-y-3">
        {liensVisibles.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:bg-blue-50 hover:border-blue-300"
          >
            <div className="font-semibold text-slate-900">{link.label}</div>
          </Link>
        ))}
      </nav>

      {utilisateur && (
        <div className="mt-auto w-full border-t border-slate-200 pt-4 text-center">
          <p className="truncate text-sm font-semibold text-slate-900">{utilisateur.nom}</p>
          <p className="truncate text-xs text-slate-500">{utilisateur.email}</p>
          <button
            type="button"
            onClick={seDeconnecter}
            className="mt-3 w-full rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </aside>
  );
}
