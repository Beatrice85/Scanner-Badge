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
  // Indicateurs « À traiter »
  congesEnAttente: number;
  sansBadge: number;
  sansChantier: number;
  fichesIncompletes: number;
  pointagesAujourdhui: number;
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
        const badges = employes.filter((employe) => Boolean(employe.badge?.uid || employe.badgeId)).length;
        // Paie calculable seulement si le taux horaire et le volume mensuel sont renseignés
        const fichesIncompletes = employes.filter(
          (employe) => !(Number(employe.tauxHoraire) > 0) || !(Number(employe.volumeMensuelObligatoire) > 0),
        ).length;
        const aujourdhui = new Date().toDateString();
        setStats({
          employes: employes.length,
          badges,
          chantiers: chantiers.length,
          pointages: pointages.length,
          conges: conges.length,
          paiesCalculables: employes.length - fichesIncompletes,
          congesEnAttente: conges.filter((conge) => conge.statut === 'EN_ATTENTE').length,
          sansBadge: employes.length - badges,
          sansChantier: employes.filter((employe) => !employe.chantierId).length,
          fichesIncompletes,
          pointagesAujourdhui: pointages.filter(
            (pointage) => pointage.timestamp && new Date(pointage.timestamp).toDateString() === aujourdhui,
          ).length,
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

  // Actions attendues de l'administrateur : chaque carte mène directement à la page concernée.
  const aTraiter = stats
    ? [
        {
          valeur: stats.congesEnAttente,
          titre: 'Congés à valider',
          detail: 'Demandes en attente de votre décision.',
          action: 'Traiter les demandes',
          to: '/conges',
        },
        {
          valeur: stats.sansBadge,
          titre: 'Employés sans badge',
          detail: 'Ils ne peuvent pas pointer sur un chantier.',
          action: 'Associer un badge',
          to: '/badges',
        },
        {
          valeur: stats.sansChantier,
          titre: 'Employés sans chantier',
          detail: 'Fiches à affecter à un chantier.',
          action: 'Compléter les fiches',
          to: '/employes',
        },
        {
          valeur: stats.fichesIncompletes,
          titre: 'Fiches de paie incomplètes',
          detail: 'Taux horaire ou volume mensuel non renseigné.',
          action: 'Renseigner la paie',
          to: '/employes',
        },
      ]
    : [];
  const actionsEnAttente = aTraiter.filter((item) => item.valeur > 0);

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

          {stats && (
            <section aria-labelledby="titre-a-traiter" className="mt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="titre-a-traiter" className="text-lg font-semibold text-slate-900">À traiter</h2>
                <p className="text-sm text-slate-600">
                  {stats.pointagesAujourdhui} pointage{stats.pointagesAujourdhui > 1 ? 's' : ''} aujourd'hui
                </p>
              </div>

              {actionsEnAttente.length === 0 ? (
                <p role="status" className="mt-3 flex items-center gap-2 rounded-bloc border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <span aria-hidden="true">✓</span> Tout est à jour : aucune action en attente.
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {actionsEnAttente.map((item) => (
                    <li key={item.titre}>
                      <Link
                        to={item.to}
                        className="group flex h-full flex-col rounded-bloc border border-amber-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-amber-100 px-2 text-lg font-bold text-amber-800">
                            {item.valeur}
                          </span>
                          <span className="font-semibold text-slate-900">{item.titre}</span>
                        </span>
                        <span className="mt-2 text-sm text-slate-600">{item.detail}</span>
                        <span className="mt-auto pt-3 text-sm font-semibold text-blue-700 group-hover:underline">
                          {item.action} <span aria-hidden="true">→</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Vue d'ensemble</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                aria-label={`Voir ${card.label.toLowerCase()} : ${loading || error ? 'indisponible' : card.value}`}
                className="flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-white text-center shadow-[0_8px_20px_rgba(59,130,246,0.14)] ring-2 ring-blue-50 transition duration-200 hover:scale-105 hover:border-blue-400 hover:shadow-[0_12px_26px_rgba(59,130,246,0.22)] md:h-32 md:w-32">
                  <p className="px-3 text-xs font-semibold uppercase leading-tight tracking-[0.08em] text-slate-600">
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
