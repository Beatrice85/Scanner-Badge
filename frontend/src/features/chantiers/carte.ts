import L, { type LatLngTuple } from 'leaflet';

// Source unique des constantes géographiques des chantiers (carte, formulaire, validation).

export const TOAMASINA_CENTRE: LatLngTuple = [-18.1443, 49.4023];
export const TOAMASINA_ZOOM = 13;

// Cadre de la carte : [sud-ouest, nord-est]. Sert à verrouiller la vue et à filtrer les marqueurs.
export const TOAMASINA_BOUNDS: [LatLngTuple, LatLngTuple] = [[-18.2, 49.34], [-18.08, 49.46]];
export const LIMITES_TOAMASINA = L.latLngBounds(TOAMASINA_BOUNDS);

// Zone autorisée pour la position d'un chantier (formulaires Ajouter / Éditer).
// Latitude : identique au cadre de la carte. Longitude : plage demandée, plus étroite que
// le cadre (49.36–49.44 contre 49.34–49.46).
export const LAT_MIN = TOAMASINA_BOUNDS[0][0]; // -18.20
export const LAT_MAX = TOAMASINA_BOUNDS[1][0]; // -18.08
export const LNG_MIN = 49.36;
export const LNG_MAX = 49.44;

// Rayon de tolérance du géorepérage, en mètres (entier : colonne Int côté backend)
export const RAYON_MIN = 10;
export const RAYON_MAX = 500;

// Position comprise dans la zone autorisée pour un chantier
export function dansZoneChantier(latitude: number, longitude: number): boolean {
  return latitude >= LAT_MIN && latitude <= LAT_MAX && longitude >= LNG_MIN && longitude <= LNG_MAX;
}

export const iconeChantier = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
