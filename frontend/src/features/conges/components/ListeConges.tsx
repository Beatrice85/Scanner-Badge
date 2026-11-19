import Sidebar from '../../../shared/components/Sidebar';
import { useAuth } from '../../auth/context/auth-context';
import MesConges from './MesConges';
import VueCongesAdmin from './VueCongesAdmin';

// Page /conges : la vue dépend du rôle renvoyé par le serveur.
export default function ListeConges() {
	const { utilisateur } = useAuth();
	const estAdmin = utilisateur?.role === 'ADMIN';

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 space-y-6">
					<div className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
							{estAdmin ? 'Dashboard' : 'Mon espace'}
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">{estAdmin ? 'Congés' : 'Mes congés'}</h1>
						<p className="mt-1 text-sm text-slate-500">
							{estAdmin
								? 'Validez ou refusez les demandes de congé des employés.'
								: 'Demandez un congé et suivez l\'état de vos demandes.'}
						</p>
					</div>

					{estAdmin ? <VueCongesAdmin /> : <MesConges />}
				</main>
			</div>
		</div>
	);
}
