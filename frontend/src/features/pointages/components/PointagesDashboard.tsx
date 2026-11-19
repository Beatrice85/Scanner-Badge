import React, { useState } from 'react';
import Sidebar from '../../../shared/components/Sidebar';
import FenetreModale from '../../../shared/components/FenetreModale';
import usePointages from '../hooks/usePointages';
import useEmployes from '../../employes/hooks/useEmployes';
import useChantiers from '../../chantiers/hooks/useChantiers';
import FormulairePointage from './FormulairePointage';
import Pagination from '../../../shared/components/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import SqueletteTableau from '../../../shared/components/SqueletteTableau';
import EtatVide from '../../../shared/components/EtatVide';
import EtatErreur from '../../../shared/components/EtatErreur';

export default function PointagesDashboard() {
  const { pointages, loading, error, fetchAll, create, update, remove } = usePointages();
  const pagination = usePagination(pointages);
  const { employes } = useEmployes();
  const { chantiers } = useChantiers();
  const [editing, setEditing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openModal(pointage: any | null = null) {
    setEditing(pointage);
    setIsModalOpen(true);
    setFormError(null);
  }

  function closeModal() {
    setEditing(null);
    setIsModalOpen(false);
    setFormError(null);
  }

  async function addOrUpdatePointage(pointage: any) {
    try {
      const selectedEmploye = employes.find((e) => e.id === pointage.employeId);
      const selectedChantier = chantiers.find((c) => c.id === pointage.chantierId);

      if (pointage.id) {
        await update(pointage.id, pointage, {
          employe: selectedEmploye,
          chantier: selectedChantier,
        });
      } else {
        await create(pointage, {
          employe: selectedEmploye,
          chantier: selectedChantier,
        });
      }
      closeModal();
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de l enregistrement');
    }
  }

  async function handleDelete(id: string | number) {
    const confirmed = window.confirm('Supprimer ce pointage ?');
    if (!confirmed) return;
    await remove(id);
  }

  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
        <Sidebar />
        <main id="contenu" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none lg:ml-80 space-y-6">
          <div className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestion des pointages</h1>
                <p className="mt-1 text-sm text-slate-500">Créez, mettez à jour ou supprimez un pointage.</p>
              </div>
              <button type="button" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800" onClick={() => openModal(null)}>
                + Ajouter un pointage
              </button>
            </div>
          </div>


          <div className="rounded-carte border border-slate-200 bg-white p-4 shadow-xl">
            {loading ? (
              <SqueletteTableau colonnes={9} libelle="Chargement des pointages…" />
            ) : error ? (
            	<EtatErreur message={error} onReessayer={fetchAll} />
            ) : (
              <>
              <div className="overflow-x-auto rounded-bloc border border-slate-200 bg-white shadow-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employé</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Chantier</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Latitude</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Longitude</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Satellites</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hors zone</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pointages.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <EtatVide
                            titre="Aucun pointage enregistré"
                            description="Les entrées et sorties des employés apparaîtront ici après leur premier badgeage."
                            action={{ libelle: '+ Ajouter un pointage', onClick: () => openModal(null) }}
                          />
                        </td>
                      </tr>
                    ) : (
                      pagination.elementsPage.map((p) => (
                        <tr key={String(p.id)} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">{p.employe?.nom || p.employeId}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.chantier?.nom || p.chantierId}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.timestamp ? new Date(p.timestamp).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.status === 'ENTREE' ? 'Entrée' : 'Sortie'}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.latitude}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.longitude}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.satellites}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.alertHorsZone ? 'Oui' : 'Non'}</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="mr-2 rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100" onClick={() => openModal(p)}>
                              Éditer
                            </button>
                            <button className="rounded-full border border-rose-300 px-3 py-1 font-medium text-rose-600 transition hover:bg-rose-50" onClick={() => handleDelete(p.id!)}>
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                premier={pagination.premier}
                dernier={pagination.dernier}
                taille={pagination.taille}
                onPageChange={pagination.setPage}
                onTailleChange={pagination.setTaille}
                libelle="pointages"
              />
              </>
            )}
          </div>

          <FenetreModale open={isModalOpen} onClose={closeModal} title={editing?.id ? 'Modifier un pointage' : 'Ajouter un pointage'}>
            <FormulairePointage edit={editing} onSubmit={addOrUpdatePointage} onCancel={closeModal} />
            {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{formError}</div> : null}
          </FenetreModale>
        </main>
      </div>
    </div>
  );
}
