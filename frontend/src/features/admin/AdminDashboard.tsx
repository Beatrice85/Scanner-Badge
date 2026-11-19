import { useEffect, useState } from 'react';
import { employesApi } from '../employes/api/employes.api';
import chantiersApi from '../chantiers/api/chantiers.api';
import pointagesApi from '../pointages/api/pointages.api';
import congesApi from '../conges/api/conges.api';
import StatChart from '../../shared/components/StatChart';
import Sidebar from '../../shared/components/Sidebar';
import { Link } from 'react-router-dom';

type Stats = {
  employes: number;
  badges: number;
  chantiers: number;
  pointages: number;
  conges: number;
  paiesCalculables: number;
  pointagesParChantier: { label: string; value: number }[];
  congesParStatut: { label: string; value: number; color: string }[];
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
        const pointagesParChantier = chantiers.map((chantier) => ({
          label: chantier.nom,
          value: pointages.filter((pointage) => String(pointage.chantierId) === String(chantier.id)).length,
        }));
        setStats({
          employes: employes.length,
          badges: employes.filter((employe) => Boolean(employe.badge?.uid || employe.badgeId)).length,
          chantiers: chantiers.length,
          pointages: pointages.length,
          conges: conges.length,
          paiesCalculables: employes.length,
          pointagesParChantier,
          congesParStatut: [
            { label: 'Approuvés', value: conges.filter((conge) => conge.statut === 'VALIDE').length, color: '#059669' },
            { label: 'En attente', value: conges.filter((conge) => conge.statut === 'EN_ATTENTE').length, color: '#d97706' },
            { label: 'Refusés', value: conges.filter((conge) => conge.statut === 'REFUSE').length, color: '#e11d48' },
          ],
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
    { label: 'Employés', value: stats?.employes ?? 0, to: '/employes' },
    { label: 'Badges associés', value: stats?.badges ?? 0, to: '/badges' },
    { label: 'Chantiers', value: stats?.chantiers ?? 0, to: '/chantiers' },
    { label: 'Pointages', value: stats?.pointages ?? 0, to: '/pointages' },
    { label: 'Congés', value: stats?.conges ?? 0, to: '/conges' },
    { label: 'Paies calculables', value: stats?.paiesCalculables ?? 0, to: '/paie' },
  ];

  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
    <div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
      <Sidebar />
      <main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 lg:mr-8 rounded-carte border border-slate-200 bg-slate-50 p-8 shadow-xl md:p-10">
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

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                aria-label={`Voir ${card.label.toLowerCase()} : ${loading || error ? 'indisponible' : card.value}`}
                className="flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-white text-center shadow-[0_8px_20px_rgba(59,130,246,0.14)] ring-2 ring-blue-50 transition duration-200 hover:scale-105 hover:border-blue-400 hover:shadow-[0_12px_26px_rgba(59,130,246,0.22)] md:h-32 md:w-32">
                  <p className="px-3 text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-600">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-700 md:text-3xl">
                    {loading || error ? '—' : card.value}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {!loading && !error && (
            <StatChart
              pointagesParChantier={stats?.pointagesParChantier ?? []}
              congesParStatut={stats?.congesParStatut ?? []}
            />
          )}
        </main>
      </div>
    </div>
  );
}
