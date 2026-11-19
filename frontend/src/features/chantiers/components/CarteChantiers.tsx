import { Fragment, useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Chantier } from '../api/chantiers.api';
import type { Pointage } from '../../pointages/types';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pointageIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  popupAnchor: [1, -26],
  shadowSize: [30, 30],
});

const horsZoneIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  popupAnchor: [1, -26],
  shadowSize: [30, 30],
});

// Vue limitée à la ville de Toamasina
const TOAMASINA_CENTRE: LatLngTuple = [-18.1443, 49.4023];
const TOAMASINA_ZOOM = 13;
const TOAMASINA_BOUNDS: LatLngBoundsExpression = [[-18.2, 49.34], [-18.08, 49.46]]; // [sud-ouest, nord-est]
const limitesToamasina = L.latLngBounds(TOAMASINA_BOUNDS);

// Coordonnées valides et situées dans les limites de Toamasina
function dansToamasina(latitude: unknown, longitude: unknown): boolean {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return latitude != null && longitude != null && Number.isFinite(lat) && Number.isFinite(lng) && limitesToamasina.contains([lat, lng]);
}

// Cadre la vue sur les chantiers de Toamasina (ou sur le centre-ville s'il n'y en a pas).
// La clé « positions » évite de recadrer à chaque rendu : seulement quand les chantiers changent.
function AjusterVue({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();
  const cle = positions.map(([lat, lng]) => `${lat},${lng}`).join('|');

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 16 });
    } else {
      map.setView(TOAMASINA_CENTRE, TOAMASINA_ZOOM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, cle]);

  return null;
}

function RecalculerTailleCarte() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });

    observer.observe(container);
    map.invalidateSize({ pan: false });

    return () => observer.disconnect();
  }, [map]);

  return null;
}

type Props = {
  chantiers: Chantier[];
  pointages?: Pointage[];
};

export default function CarteChantiers({ chantiers, pointages = [] }: Props) {
  // Seuls les chantiers situés dans Toamasina sont placés sur la carte (tous restent dans la liste).
  const chantiersCarte = useMemo(
    () => chantiers.filter((c) => dansToamasina(c.latitude, c.longitude)),
    [chantiers],
  );
  const horsCarte = chantiers.length - chantiersCarte.length;
  const positionsChantiers = useMemo<LatLngTuple[]>(
    () => chantiersCarte.map((c) => [Number(c.latitude), Number(c.longitude)]),
    [chantiersCarte],
  );
  // Pointages des chantiers affichés, avec des coordonnées valides dans Toamasina
  const pointagesToShow = pointages.filter(
    (p) => chantiersCarte.some((c) => String(c.id) === String(p.chantierId)) && dansToamasina(p.latitude, p.longitude),
  );

  return (
    <div className="rounded-carte border border-slate-200 bg-white p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Carte des chantiers</h3>
          <p className="text-sm text-slate-500">Chantiers de Toamasina : position et zone de tolérance.</p>
        </div>
      </div>

      {/* relative z-0 isolate : stacking context propre, les z-index internes de Leaflet (400, 1000) n'en sortent pas */}
      <div className="relative z-0 isolate h-[420px] w-full overflow-hidden rounded-bloc border border-slate-200">
        <MapContainer
          center={TOAMASINA_CENTRE}
          zoom={TOAMASINA_ZOOM}
          minZoom={12}
          maxBounds={TOAMASINA_BOUNDS}
          maxBoundsViscosity={1.0}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <RecalculerTailleCarte />
          <AjusterVue positions={positionsChantiers} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {chantiersCarte.map((chantier) => (
            <Fragment key={String(chantier.id)}>
              <Marker position={[chantier.latitude, chantier.longitude]} icon={markerIcon}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{chantier.nom}</p>
                    <p className="text-sm text-slate-600">Latitude: {chantier.latitude}</p>
                    <p className="text-sm text-slate-600">Longitude: {chantier.longitude}</p>
                    <p className="text-sm text-slate-600">Tolérance: {chantier.rayonToleranceM} m</p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[chantier.latitude, chantier.longitude]}
                radius={chantier.rayonToleranceM}
                pathOptions={{ color: '#16a34a', fillColor: '#a7f3d0', fillOpacity: 0.2 }}
              />
            </Fragment>
          ))}

          {pointagesToShow.map((pointage) => {
            const position = [pointage.latitude, pointage.longitude] as [number, number];
            const chantier = chantiersCarte.find((c) => String(c.id) === String(pointage.chantierId));
            const icon = pointage.alertHorsZone ? horsZoneIcon : pointageIcon;

            return (
              <Marker key={String(pointage.id)} position={position} icon={icon}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">Pointage {pointage.status}</p>
                    <p className="text-sm text-slate-600">Employé ID: {pointage.employeId}</p>
                    <p className="text-sm text-slate-600">Chantier: {chantier?.nom || pointage.chantierId}</p>
                    <p className="text-sm text-slate-600">Latitude: {pointage.latitude}</p>
                    <p className="text-sm text-slate-600">Longitude: {pointage.longitude}</p>
                    <p className="text-sm text-slate-600">Hors zone: {pointage.alertHorsZone ? 'Oui' : 'Non'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {horsCarte > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          {horsCarte} chantier{horsCarte > 1 ? 's' : ''} situé{horsCarte > 1 ? 's' : ''} hors de Toamasina{' '}
          {horsCarte > 1 ? 'ne sont pas affichés' : 'n’est pas affiché'} sur la carte (voir la liste ci-dessous).
        </p>
      )}
    </div>
  );
}
