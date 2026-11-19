import client from '../../../shared/lib/client-http';
import type { Role } from '../../auth/types';
import type { CompteUtilisateur } from '../types';

// Routes réservées à l'ADMIN.
export const usersApi = {
  list: async (): Promise<CompteUtilisateur[]> => {
    return client.get('/users');
  },
  // 403 : son propre rôle ; 409 : rétrogradation du dernier administrateur.
  changerRole: async (id: string, role: Role): Promise<CompteUtilisateur> => {
    return client.patch(`/users/${id}/role`, { role });
  },
  associerEmploye: async (id: string, employeId: string): Promise<CompteUtilisateur> => {
    return client.patch(`/users/${id}/employe`, { employeId });
  },
};

export default usersApi;
