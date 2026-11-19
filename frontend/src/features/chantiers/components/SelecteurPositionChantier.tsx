import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { TOAMASINA_BOUNDS, TOAMASINA_CENTRE, TOAMASINA_ZOOM, dansZoneChantier, iconeChantier } from '../carte';
import RecalculerTailleCarte from './RecalculerTailleCarte';

type Props = {
	// Position actuelle (si valide) : affichée par un marqueur
	position: [number, number] | null;
	// Clic dans la zone autorisée : coordonnées arrondies à 4 décimales
	onChoisir: (latitude: string, longitude: string) => void;
	// Clic hors de Toamasina : aucune valeur n'est remplie
	onHorsZone: () => void;
};

function EcouterClic({ onChoisir, onHorsZone }: Pick<Props, 'onChoisir' | 'onHorsZone'>) {
	useMapEvents({
		click(evenement) {
			const { lat, lng } = evenement.latlng;
			if (dansZoneChantier(lat, lng)) {
				onChoisir(lat.toFixed(4), lng.toFixed(4));
			} else {
				onHorsZone();
			}
		},
	});
	return null;
}

// Petite carte de Toamasina pour choisir la position d'un chantier d'un clic.
// La saisie au clavier reste possible (alternative accessible au clic sur la carte).
export default function SelecteurPositionChantier({ position, onChoisir, onHorsZone }: Props) {
	return (
		<div className="relative z-0 isolate h-48 w-full overflow-hidden rounded-xl border border-white/10">
			<MapContainer
				center={position ?? TOAMASINA_CENTRE}
				zoom={TOAMASINA_ZOOM}
				minZoom={12}
				maxBounds={TOAMASINA_BOUNDS}
				maxBoundsViscosity={1.0}
				className="h-full w-full cursor-crosshair"
				scrollWheelZoom={false}
			>
				<RecalculerTailleCarte />
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<EcouterClic onChoisir={onChoisir} onHorsZone={onHorsZone} />
				{position && <Marker position={position} icon={iconeChantier} />}
			</MapContainer>
		</div>
	);
}
