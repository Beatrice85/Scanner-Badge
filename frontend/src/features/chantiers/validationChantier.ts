import { LAT_MAX, LAT_MIN, LNG_MAX, LNG_MIN, RAYON_MAX, RAYON_MIN } from './carte';

// Validation pure (sans React) des champs d'un chantier, partagée par les modales Ajouter et Éditer.

export type ChampsChantier = {
	nom: string;
	latitude: string;
	longitude: string;
	rayon: string;
};

export type ErreursChantier = Partial<Record<keyof ChampsChantier, string>>;

export type ResultatValidation = { valide: boolean; erreurs: ErreursChantier };

// Saisie -> nombre. Accepte la virgule décimale (« -18,1443 »). null si vide ou non numérique.
export function versNombre(valeur: string | number | null | undefined): number | null {
	if (valeur === null || valeur === undefined) return null;
	const texte = String(valeur).trim().replace(',', '.');
	if (texte === '') return null;
	const nombre = Number(texte);
	return Number.isFinite(nombre) ? nombre : null;
}

function formater(nombre: number, decimales: number): string {
	return nombre.toFixed(decimales);
}

function verifierPlage(valeur: string, libelle: string, min: number, max: number, decimales: number): string | undefined {
	const nombre = versNombre(valeur);
	if (nombre === null) return `${libelle} est obligatoire.`;
	if (nombre < min || nombre > max) {
		return `${libelle} doit être comprise entre ${formater(min, decimales)} et ${formater(max, decimales)}.`;
	}
	return undefined;
}

export function validerChantier({ nom, latitude, longitude, rayon }: ChampsChantier): ResultatValidation {
	const erreurs: ErreursChantier = {};

	if (!nom.trim()) erreurs.nom = 'Le nom du chantier est obligatoire.';

	const erreurLatitude = verifierPlage(latitude, 'La latitude', LAT_MIN, LAT_MAX, 2);
	if (erreurLatitude) erreurs.latitude = erreurLatitude;

	const erreurLongitude = verifierPlage(longitude, 'La longitude', LNG_MIN, LNG_MAX, 2);
	if (erreurLongitude) erreurs.longitude = erreurLongitude;

	const valeurRayon = versNombre(rayon);
	if (valeurRayon === null) {
		erreurs.rayon = 'Le rayon de tolérance est obligatoire.';
	} else if (!Number.isInteger(valeurRayon)) {
		erreurs.rayon = 'Le rayon doit être un nombre entier de mètres.';
	} else if (valeurRayon < RAYON_MIN || valeurRayon > RAYON_MAX) {
		erreurs.rayon = `Le rayon doit être compris entre ${RAYON_MIN} et ${RAYON_MAX} m.`;
	}

	return { valide: Object.keys(erreurs).length === 0, erreurs };
}
