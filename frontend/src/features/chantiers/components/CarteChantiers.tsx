import { Fragment, useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
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

const madagascarCenter: [number, number] = [-18.9, 46.7];

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
  const pointagesToShow = pointages.filter((p) => chantiers.some((c) => String(c.id) === String(p.chantierId)));

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Carte des chantiers</h3>
          <p className="text-sm text-slate-500">Visualisez la position et la zone de tolérance de chaque chantier.</p>
        </div>
      </div>

      {/* relative z-0 isolate : stacking context propre, les z-index internes de Leaflet (400, 1000) n'en sortent pas */}
      <div className="relative z-0 isolate h-[420px] w-full overflow-hidden rounded-[20px] border border-slate-200">
        <MapContainer
          center={madagascarCenter}
          zoom={5}
          minZoom={5}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <RecalculerTailleCarte />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {chantiers.map((chantier) => (
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
            const chantier = chantiers.find((c) => String(c.id) === String(pointage.chantierId));
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
    </div>
  );
}
