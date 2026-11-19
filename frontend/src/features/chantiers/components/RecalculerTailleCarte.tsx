import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Recalcule la taille de la carte quand son conteneur change (mise en page, ouverture d'une modale),
// sinon Leaflet affiche des tuiles grises ou décalées.
export default function RecalculerTailleCarte() {
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
