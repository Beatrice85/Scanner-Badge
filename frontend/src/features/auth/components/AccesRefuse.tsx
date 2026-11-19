import { Link } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../context/auth-context';

export default function AccesRefuse() {
	const { utilisateur } = useAuth();
	const retour = utilisateur ? accueilDuRole(utilisateur.role) : '/login';

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#eef2ff] px-4">
			<div className="max-w-md rounded-carte border border-slate-200 bg-white p-8 text-center shadow-xl">
				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Accès refusé</p>
				<h1 className="mt-3 text-2xl font-semibold text-slate-900">Vous n'avez pas accès à cette page</h1>
				<p className="mt-2 text-sm text-slate-500">Cette page est réservée à un autre rôle que le vôtre.</p>
				<Link
					to={retour}
					className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
				>
					Retour à mon espace
				</Link>
			</div>
		</div>
	);
}
