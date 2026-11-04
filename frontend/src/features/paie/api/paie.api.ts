import client from '../../../shared/lib/client-http';
import type { ResultatPaie } from '../types';

export type { ResultatPaie };

// Le backend n'expose qu'un calcul en lecture seule (pas de CRUD).
// dateDebut / dateFin : format "AAAA-MM-JJ".
export const paieApi = {
  calculer: async (employeId: string, dateDebut: string, dateFin: string): Promise<ResultatPaie> => {
    const params = new URLSearchParams({ dateDebut, dateFin });
    return client.get(`/paie/${encodeURIComponent(employeId)}?${params.toString()}`);
  },
};

export default paieApi;
