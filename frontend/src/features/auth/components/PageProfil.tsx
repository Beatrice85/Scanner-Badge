import { useState, type ChangeEvent } from 'react';
import Sidebar from '../../../shared/components/Sidebar';
import { useAuth } from '../context/auth-context';
import authApi from '../api/auth.api';
import { notifierToast } from '../../../shared/lib/toast';

const TAILLE_MAX_PHOTO = 20 * 1024 * 1024;
const ROLES = { ADMIN: 'Administrateur', EMPLOYE: 'Employé' } as const;

function initiales(nom: string): string {
	const mots = nom.trim().split(/\s+/).filter(Boolean);
	return (mots.length > 1 ? mots[0][0] + mots[mots.length - 1][0] : (mots[0] ?? '?').slice(0, 2)).toUpperCase();
}

export default function PageProfil() {
	const { utilisateur, mettreAJourUtilisateur } = useAuth();
	// Photo enregistrée sur le serveur (Supabase Storage), visible sur tous les appareils
	const photoActuelle = utilisateur?.photo ?? null;
	const [apercu, setApercu] = useState<string | null>(null);
	const [fichier, setFichier] = useState<File | null>(null);
	const [envoi, setEnvoi] = useState(false);
	const [modificationEnCours, setModificationEnCours] = useState(false);
	const [supprimerPhoto, setSupprimerPhoto] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	if (!utilisateur) return null;

	function choisirPhoto(event: ChangeEvent<HTMLInputElement>) {
		const fichierChoisi = event.target.files?.[0];
		event.target.value = '';
		if (!fichierChoisi) return;

		setErreur(null);
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(fichierChoisi.type)) {
			setErreur('Choisissez une image au format JPG, PNG ou WebP.');
			return;
		}
		if (fichierChoisi.size > TAILLE_MAX_PHOTO) {
			setErreur('La photo ne doit pas dépasser 20 Mo.');
			return;
		}

		const lecteur = new FileReader();
		lecteur.onload = () => {
			if (typeof lecteur.result !== 'string') {
				setErreur('Impossible de lire cette image. Essayez un autre fichier.');
				return;
			}
			setApercu(lecteur.result);
			setFichier(fichierChoisi);
			setSupprimerPhoto(false);
			setModificationEnCours(true);
		};
		lecteur.onerror = () => setErreur('Impossible de lire cette image. Essayez un autre fichier.');
		lecteur.readAsDataURL(fichierChoisi);
	}

	function annulerModification() {
		setApercu(null);
		setFichier(null);
		setSupprimerPhoto(false);
		setModificationEnCours(false);
		setErreur(null);
	}

	async function enregistrerModification() {
		setErreur(null);
		setEnvoi(true);
		const suppression = supprimerPhoto;
		try {
			const compte = suppression
				? await authApi.supprimerPhoto()
				: fichier
					? await authApi.changerPhoto(fichier)
					: null;
			if (compte) mettreAJourUtilisateur({ photoUrl: compte.photoUrl ?? null });
			setApercu(null);
			setFichier(null);
			setSupprimerPhoto(false);
			setModificationEnCours(false);
			notifierToast(suppression ? 'Photo de profil supprimée.' : 'Photo de profil mise à jour.');
		} catch (err: any) {
			setErreur(err?.message || "La photo n'a pas pu être enregistrée. Réessayez.");
		} finally {
			setEnvoi(false);
		}
	}

	const photoAffichee = supprimerPhoto ? null : apercu ?? photoActuelle;

	return (
		<div className="min-h-screen bg-[#eef2ff] px-4 py-6 text-slate-900 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:pt-24">
				<Sidebar />
				<main id="contenu" tabIndex={-1} className="min-w-0 flex-1 space-y-6 focus:outline-none lg:ml-80">
					<header className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Compte</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">Mon profil</h1>
						<p className="mt-2 text-sm text-slate-600">Consultez vos informations et gérez votre photo de profil.</p>
					</header>

					{erreur && <div role="alert" className="rounded-bloc border border-rose-300 bg-rose-50 p-4 text-rose-700">{erreur}</div>}

					<section aria-labelledby="titre-photo" className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<h2 id="titre-photo" className="text-lg font-semibold text-slate-900">Photo de profil</h2>
						<div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
							<div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-3xl font-bold text-blue-700 ring-4 ring-blue-50">
								{photoAffichee ? (
									<img src={photoAffichee} alt={`Aperçu de la photo de ${utilisateur.nom}`} className="h-full w-full object-cover" />
								) : initiales(utilisateur.nom)}
							</div>
							<div className="min-w-0">
								<p className="font-semibold text-slate-900">{modificationEnCours ? 'Aperçu avant enregistrement' : utilisateur.nom}</p>
								<p className="mt-1 text-sm text-slate-600">JPG, PNG ou WebP, 20 Mo maximum.</p>
								<div className="mt-4 flex flex-wrap gap-3">
									<label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
										{photoActuelle ? 'Choisir une autre photo' : 'Ajouter une photo'}
										<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choisirPhoto} />
									</label>
									{photoActuelle && !supprimerPhoto && (
										<button
											type="button"
											onClick={() => {
												setSupprimerPhoto(true);
												setApercu(null);
												setModificationEnCours(true);
												setErreur(null);
											}}
											className="min-h-11 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
										>
											Supprimer la photo
										</button>
									)}
								</div>
							</div>
						</div>
						{modificationEnCours && (
							<div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
								<button type="button" onClick={enregistrerModification} disabled={envoi} className="min-h-11 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70">
									{envoi ? 'Enregistrement…' : supprimerPhoto ? 'Confirmer la suppression' : 'Enregistrer la photo'}
								</button>
								<button type="button" onClick={annulerModification} disabled={envoi} className="min-h-11 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
									Annuler
								</button>
							</div>
						)}
					</section>

					<section aria-labelledby="titre-informations" className="rounded-carte border border-slate-200 bg-white p-6 shadow-xl">
						<h2 id="titre-informations" className="text-lg font-semibold text-slate-900">Informations du compte</h2>
						<dl className="mt-4 grid gap-4 sm:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<dt className="text-sm text-slate-600">Nom complet</dt>
								<dd className="mt-1 font-semibold text-slate-900">{utilisateur.nom}</dd>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<dt className="text-sm text-slate-600">Adresse e-mail</dt>
								<dd className="mt-1 break-all font-semibold text-slate-900">{utilisateur.email}</dd>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<dt className="text-sm text-slate-600">Rôle</dt>
								<dd className="mt-1 font-semibold text-slate-900">{ROLES[utilisateur.role]}</dd>
							</div>
						</dl>
						<p className="mt-4 text-sm text-slate-600">
							Le nom et l’adresse e-mail sont affichés depuis votre compte. Leur modification n’est pas encore disponible.
						</p>
					</section>
				</main>
			</div>
		</div>
	);
}
