import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../../shared/components/Sidebar';
import { lirePhotoProfil } from '../../../shared/lib/session';
import usersApi from '../api/users.api';
import type { CompteUtilisateur } from '../types';

const LIBELLES_ROLE = { ADMIN: 'Administrateur', EMPLOYE: 'Employé' } as const;

function initiales(nom: string): string {
	const mots = nom.trim().split(/\s+/).filter(Boolean);
	return (mots.length > 1 ? mots[0][0] + mots[mots.length - 1][0] : (mots[0] ?? '?').slice(0, 2)).toUpperCase();
}

export default function PageProfilUtilisateur() {
	const { id } = useParams<{ id: string }>();
	const [utilisateur, setUtilisateur] = useState<CompteUtilisateur | null>(null);
	const [chargement, setChargement] = useState(true);
	const [erreur, setErreur] = useState<string | null>(null);

	useEffect(() => {
		let actif = true;

		async function chargerProfil() {
			setChargement(true);
			setErreur(null);
			setUtilisateur(null);
			try {
				const utilisateurs = await usersApi.list();
				if (actif) {
					setUtilisateur(utilisateurs.find(compte => compte.id === id) ?? null);
				}
			} catch (err) {
				if (actif) {
					setErreur(err instanceof Error ? err.message : 'Impossible de charger ce profil.');
				}
			} finally {
				if (actif) setChargement(false);
			}
		}

		void chargerProfil();
		return () => {
			actif = false;
		};
	}, [id]);

	const photoProfil = utilisateur ? lirePhotoProfil(utilisateur.id) : null;

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="min-w-0 flex-1 space-y-6 focus:outline-none lg:ml-80">
					<header className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<Link to="/utilisateurs" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
							Retour aux utilisateurs
						</Link>
						<p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Compte</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">Profil utilisateur</h1>
					</header>

					{chargement && (
						<div role="status" aria-live="polite" className="rounded-carte border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-xl">
							Chargement du profil...
						</div>
					)}

					{erreur && (
						<div role="alert" className="rounded-bloc border border-rose-300 bg-rose-50 p-4 text-rose-700">
							{erreur}
						</div>
					)}

					{!chargement && !erreur && !utilisateur && (
						<div role="alert" className="rounded-bloc border border-amber-300 bg-amber-50 p-4 text-amber-800">
							Ce compte utilisateur est introuvable.
						</div>
					)}

					{!chargement && utilisateur && (
						<section aria-labelledby="titre-informations-profil" className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
							<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
								<div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-3xl font-bold text-blue-700 ring-4 ring-blue-50">
									{photoProfil ? (
										<img src={photoProfil} alt={`Photo de ${utilisateur.nom}`} className="h-full w-full object-cover" />
									) : initiales(utilisateur.nom)}
								</div>
								<div>
									<h2 id="titre-informations-profil" className="text-xl font-semibold text-slate-900">{utilisateur.nom}</h2>
									<p className="mt-1 text-sm text-slate-600">{LIBELLES_ROLE[utilisateur.role]}</p>
								</div>
							</div>

							<dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
								<div className="rounded-2xl bg-slate-50 p-4">
									<dt className="text-sm text-slate-600">Adresse e-mail</dt>
									<dd className="mt-1 break-all font-semibold text-slate-900">{utilisateur.email}</dd>
								</div>
								<div className="rounded-2xl bg-slate-50 p-4">
									<dt className="text-sm text-slate-600">Fiche employé</dt>
									<dd className="mt-1 font-semibold text-slate-900">{utilisateur.employeId ?? 'Non liée'}</dd>
								</div>
							</dl>
						</section>
					)}
				</main>
			</div>
		</div>
	);
}
