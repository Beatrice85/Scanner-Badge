import Sidebar from '../../../shared/components/Sidebar';

// Page d'attente : la route GET /paie/:employeId n'est pas encore montée dans
// backend/src/app.ts. L'API (paie.api.ts) et le hook (usePaie) sont prêts ; l'interface
// de calcul sera construite une fois la route disponible. Page non routée pour l'instant.
export default function ListePaie() {
	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row">
				<Sidebar />
				<main className="flex-1 lg:ml-80">
					<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Dashboard</p>
						<h2 className="mt-2 text-2xl font-semibold text-slate-900">Paie</h2>
						<p className="mt-2 text-sm text-slate-500">Le calcul de la paie sera disponible prochainement.</p>
					</div>
				</main>
			</div>
		</div>
	);
}
