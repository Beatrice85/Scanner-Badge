import { useEffect, useState } from 'react';
import { employesApi } from '../employes/api/employes.api';
import chantiersApi from '../chantiers/api/chantiers.api';
import pointagesApi from '../pointages/api/pointages.api';
import congesApi from '../conges/api/conges.api';
import StatChart from '../../shared/components/StatChart';
import Sidebar from '../../shared/components/Sidebar';

type Stats = {
  employes: number;
  badges: number;
  chantiers: number;
  pointages: number;
  conges: number;
  paiesCalculables: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [employes, chantiers, pointages, conges] = await Promise.all([
          employesApi.list(),
          chantiersApi.list(),
          pointagesApi.list(),
          congesApi.list(),
        ]);
        setStats({
          employes: employes.length,
          badges: employes.filter((employe) => Boolean(employe.badge?.uid || employe.badgeId)).length,
          chantiers: chantiers.length,
          pointages: pointages.length,
          conges: conges.length,
          paiesCalculables: employes.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Employés', value: stats?.employes ?? 0 },
    { label: 'Badges associés', value: stats?.badges ?? 0 },
    { label: 'Chantiers', value: stats?.chantiers ?? 0 },
    { label: 'Pointages', value: stats?.pointages ?? 0 },
    { label: 'Congés', value: stats?.conges ?? 0 },
    { label: 'Paies calculables', value: stats?.paiesCalculables ?? 0 },
  ];

  const chartData = statCards.map((card) => ({ label: card.label, value: card.value }));

  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
    <div className="mx-auto flex w-full flex-col gap-6 lg:flex-row">
      <Sidebar />
      <main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 lg:mr-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Scanner Badge</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Tableau de bord administrateur
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Gérez les employés et les chantiers, et consultez les volumes de badges, pointages, congés et paies calculables.
          </p>

          {loading && (
            <p className="mt-6 text-sm text-slate-600" role="status" aria-live="polite">
              Chargement des statistiques…
            </p>
          )}
          {error && (
            <p className="mt-6 text-sm text-rose-700" role="alert">
              Erreur lors du chargement des statistiques : {error}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-blue-700">
                  {loading || error ? '—' : card.value}
                </p>
              </div>
            ))}
          </div>

          {!loading && !error && <StatChart data={chartData} />}
        </main>
      </div>
    </div>
  );
}
