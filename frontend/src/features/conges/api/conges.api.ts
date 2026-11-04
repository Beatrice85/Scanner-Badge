import client from '../../../shared/lib/client-http';
import type { Conge, CreateCongePayload, UpdateCongePayload } from '../types';

export type { Conge, CreateCongePayload, UpdateCongePayload };

export const congesApi = {
  list: async (): Promise<Conge[]> => {
    return client.get('/conges');
  },
  listByEmploye: async (employeId: string): Promise<Conge[]> => {
    return client.get(`/conges/employe/${employeId}`);
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
};

export default congesApi;
