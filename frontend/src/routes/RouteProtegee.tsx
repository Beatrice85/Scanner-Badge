import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/auth-context';
import type { Role } from '../features/auth/types';
import Chargement from '../shared/components/Chargement';
import { lireToken } from '../shared/lib/session';

type Props = {
	children: React.ReactElement;
	// Rôle requis (vérifié sur le rôle renvoyé par le serveur). Absent : tout utilisateur connecté.
	role?: Role;
};

// Contrôle d'affichage uniquement : la vraie protection est faite par le backend.
export default function RouteProtegee({ children, role }: Props) {
	const { utilisateur, chargement, erreur, rafraichir } = useAuth();
	const location = useLocation();

	if (chargement) {
		return <Chargement fullScreen message="Vérification de la session..." />;
	}

	if (!utilisateur) {
		// Token conservé mais serveur injoignable : on propose de réessayer plutôt que de déconnecter.
		if (erreur && lireToken()) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-[#eef2ff] px-4">
					<div role="alert" className="max-w-md rounded-carte border border-rose-300 bg-white p-6 text-center shadow-xl">
						<p className="font-semibold text-rose-700">Impossible de vérifier votre session</p>
						<p className="mt-2 text-sm text-slate-600">{erreur}</p>
						<button
							type="button"
							onClick={() => rafraichir()}
							className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
						>
							Réessayer
						</button>
					</div>
				</div>
			);
		}
		return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;
	}

	if (role && utilisateur.role !== role) {
		return <Navigate to="/acces-refuse" replace />;
	}

	return children;
}
