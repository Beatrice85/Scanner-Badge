// Réponse de GET /paie/:employeId?dateDebut=&dateFin=
// (backend/src/modules/paie/paie.service.ts, méthode calculerPaie).
// Calcul à la volée : rien n'est enregistré côté backend.
export type ResultatPaie = {
	employeId: string;
	nom: string;
	prenom: string;
	periode: {
		dateDebut: string;
		dateFin: string;
	};
	tauxHoraire: number;

	heuresTravaillees: number;
	heuresCongesPayes: number;
	heuresSupplementaires: number;
	heuresAbsenceNonJustifiee: number;

	joursCongesPayes: number;

	salaireHeuresTravaillees: number;
	salaireCongesPayes: number;
	bonusHeuresSupplementaires: number;
	penalites: number;

	salaireTotal: number;
};
