import client from '../../../shared/lib/client-http';
import type { Conge, CreateCongePayload, StatutConge, UpdateCongePayload } from '../types';

export type { Conge, CreateCongePayload, StatutConge, UpdateCongePayload };

export const congesApi = {
  // ADMIN uniquement. statut absent : tous les congés.
  list: async (statut?: StatutConge): Promise<Conge[]> => {
    return client.get(statut ? `/conges?statut=${statut}` : '/conges');
  },
  // Congés de l'employé lié au compte connecté (403 si le compte n'est lié à aucun employé).
  mesConges: async (): Promise<Conge[]> => {
    return client.get('/conges/moi');
  },
  get: async (id: string): Promise<Conge> => {
    return client.get(`/conges/${id}`);
  },
  create: async (payload: CreateCongePayload): Promise<Conge> => {
    return client.post('/conges', payload);
  },
  update: async (id: string, payload: UpdateCongePayload): Promise<Conge> => {
    return client.put(`/conges/${id}`, payload);
  },
  del: async (id: string) => {
    return client.del(`/conges/${id}`);
  },
  // ADMIN uniquement
  valider: async (id: string): Promise<Conge> => {
    return client.patch(`/conges/${id}/valider`);
  },
  refuser: async (id: string, motifRefus: string): Promise<Conge> => {
    return client.patch(`/conges/${id}/refuser`, { motifRefus });
  },
};

export default congesApi;
