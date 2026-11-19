import React, { useEffect, useId, useMemo, useState } from 'react';
import { LAT_MAX, LAT_MIN, LNG_MAX, LNG_MIN, RAYON_MAX, RAYON_MIN, dansZoneChantier } from '../carte';
import { validerChantier, versNombre, type ChampsChantier } from '../validationChantier';
import SelecteurPositionChantier from './SelecteurPositionChantier';

type Props = {
	edit?: any;
	onSubmit?: (chantier: any) => void;
	onCancel?: () => void;
};

const CHAMPS_VIDES: ChampsChantier = { nom: '', latitude: '', longitude: '', rayon: '' };
const AUCUN_TOUCHE: Record<keyof ChampsChantier, boolean> = { nom: false, latitude: false, longitude: false, rayon: false };

const classeChamp = (enErreur: boolean) =>
	`w-full rounded-xl border bg-slate-950/40 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none ${
		enErreur ? 'border-rose-400 focus:border-rose-400' : 'border-white/10 focus:border-emerald-400'
	}`;

// Utilisé par les modales « Ajouter un chantier » et « Modifier un chantier ».
// Validation : à la sortie d'un champ (onBlur), puis à chaque saisie, et à la soumission.
export default function FormulaireChantier({ edit, onSubmit, onCancel }: Props) {
	const id = useId();
	const [champs, setChamps] = useState<ChampsChantier>(CHAMPS_VIDES);
	const [touches, setTouches] = useState(AUCUN_TOUCHE);
	const [messageCarte, setMessageCarte] = useState<string | null>(null);

	useEffect(() => {
		setChamps(
			edit
				? {
						nom: edit.nom || '',
						latitude: edit.latitude != null ? String(edit.latitude) : '',
						longitude: edit.longitude != null ? String(edit.longitude) : '',
						rayon: edit.rayonToleranceM != null ? String(edit.rayonToleranceM) : '',
					}
				: CHAMPS_VIDES,
		);
		// En modification, les valeurs existantes sont vérifiées tout de suite.
		setTouches(edit ? { nom: true, latitude: true, longitude: true, rayon: true } : AUCUN_TOUCHE);
		setMessageCarte(null);
	}, [edit]);

	const { valide, erreurs } = useMemo(() => validerChantier(champs), [champs]);
	const erreurAffichee = (champ: keyof ChampsChantier) => (touches[champ] ? erreurs[champ] : undefined);

	function modifier(champ: keyof ChampsChantier, valeur: string) {
		setChamps((actuels) => ({ ...actuels, [champ]: valeur }));
	}

	function toucher(champ: keyof ChampsChantier) {
		setTouches((actuels) => ({ ...actuels, [champ]: true }));
	}

	// Clic sur la carte (dans la zone) : 4 décimales, puis validation des deux champs.
	function choisirSurCarte(latitude: string, longitude: string) {
		setChamps((actuels) => ({ ...actuels, latitude, longitude }));
		setTouches((actuels) => ({ ...actuels, latitude: true, longitude: true }));
		setMessageCarte(null);
	}

	// Position affichée sur la carte : seulement si les deux coordonnées sont valides.
	const latitude = versNombre(champs.latitude);
	const longitude = versNombre(champs.longitude);
	const position: [number, number] | null =
		latitude !== null && longitude !== null && dansZoneChantier(latitude, longitude) ? [latitude, longitude] : null;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setTouches({ nom: true, latitude: true, longitude: true, rayon: true });
		if (!valide) return;
		onSubmit?.({
			...(edit || {}),
			nom: champs.nom.trim(),
			latitude: versNombre(champs.latitude),
			longitude: versNombre(champs.longitude),
			rayonToleranceM: versNombre(champs.rayon),
		});
	}

	const isEditing = Boolean(edit?.id);
	const libelleBouton = isEditing ? 'Enregistrer les modifications' : 'Créer le chantier';

	// Champ avec libellé, aide (plage autorisée) et message d'erreur reliés au champ.
	function rendreChamp(
		champ: keyof ChampsChantier,
		libelle: string,
		aide: string | null,
		attributs: React.InputHTMLAttributes<HTMLInputElement>,
	) {
		const erreur = erreurAffichee(champ);
		const idChamp = `${id}-${champ}`;
		const idAide = `${idChamp}-aide`;
		const idErreur = `${idChamp}-erreur`;
		return (
			<div>
				<label htmlFor={idChamp} className="mb-1 block text-sm font-medium text-slate-200">{libelle}</label>
				<input
					id={idChamp}
					value={champs[champ]}
					onChange={(e) => modifier(champ, e.target.value)}
					onBlur={() => toucher(champ)}
					aria-invalid={erreur ? true : undefined}
					aria-describedby={[aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ') || undefined}
					className={classeChamp(Boolean(erreur))}
					{...attributs}
				/>
				{aide && <p id={idAide} className="mt-1 text-xs text-slate-400">{aide}</p>}
				{erreur && <p id={idErreur} className="mt-1 text-sm font-medium text-rose-300">{erreur}</p>}
			</div>
		);
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="rounded-carte border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl">
			<div className="mb-4">
				<p className="text-sm text-slate-300">{isEditing ? 'Mettez à jour les informations du chantier.' : 'Ajoutez un nouveau chantier à la plateforme.'}</p>
			</div>

			<div className="space-y-3">
				{rendreChamp('nom', 'Nom du chantier', null, { required: true, placeholder: 'Chantier Nord', autoComplete: 'off' })}

				<div>
					<p className="mb-1 text-sm font-medium text-slate-200">Position sur la carte</p>
					<SelecteurPositionChantier
						position={position}
						onChoisir={choisirSurCarte}
						onHorsZone={() => setMessageCarte('Veuillez cliquer à l’intérieur de Toamasina.')}
					/>
					<p className="mt-1 text-xs text-slate-400">Cliquez sur la carte ou saisissez les coordonnées ci-dessous.</p>
					{messageCarte && <p role="alert" className="mt-1 text-sm font-medium text-rose-300">{messageCarte}</p>}
				</div>

				{rendreChamp('latitude', 'Latitude', `Entre ${LAT_MIN.toFixed(2)} et ${LAT_MAX.toFixed(2)} (Toamasina)`, {
					required: true, type: 'number', step: 'any', min: LAT_MIN, max: LAT_MAX, inputMode: 'decimal', placeholder: '-18.1443',
				})}
				{rendreChamp('longitude', 'Longitude', `Entre ${LNG_MIN.toFixed(2)} et ${LNG_MAX.toFixed(2)} (Toamasina)`, {
					required: true, type: 'number', step: 'any', min: LNG_MIN, max: LNG_MAX, inputMode: 'decimal', placeholder: '49.4023',
				})}
				{rendreChamp('rayon', 'Rayon Tolérance (m)', `Entre ${RAYON_MIN} et ${RAYON_MAX} m`, {
					required: true, type: 'number', step: 1, min: RAYON_MIN, max: RAYON_MAX, inputMode: 'numeric', placeholder: '100',
				})}
			</div>

			<div className="mt-5 flex flex-wrap items-center gap-3">
				{onCancel ? (
					<button type="button" onClick={onCancel} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
						Annuler
					</button>
				) : null}
				<button
					type="submit"
					disabled={!valide}
					aria-describedby={!valide ? `${id}-indication` : undefined}
					className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{libelleBouton}
				</button>
				{!valide && (
					<p id={`${id}-indication`} className="w-full text-xs text-slate-400">
						Remplissez correctement tous les champs pour activer « {libelleBouton} ».
					</p>
				)}
			</div>
		</form>
	);
}
