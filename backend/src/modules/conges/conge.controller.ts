import { Request, Response } from "express";
import { CongeService } from "./conge.service";
import { getAuthUser } from "../../middleware/auth.middleware";
import { HttpError } from "../../errors/http-error";

// Erreurs métier (HttpError) : leur code ; autres erreurs : code par défaut. Toujours { message }.
function repondreErreur(res: Response, error: any, statutParDefaut: number, messageParDefaut?: string) {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
    }
    return res.status(statutParDefaut).json({ message: messageParDefaut ?? error?.message ?? "Erreur" });
}

export class CongeController {

    private service = new CongeService()

    async getAll(req: Request, res: Response) {
        try {
            const statut = typeof req.query.statut === "string" ? req.query.statut : undefined;
            const conges = await this.service.getAll(statut)

            return res.status(200).json(conges)

        } catch (error) {
            return repondreErreur(res, error, 500, "erreur lor de la recuperation des conges")
        }
    }


    async getMine(req: Request, res: Response) {
        try {
            const conges = await this.service.getMine(getAuthUser(req))

            return res.status(200).json(conges)

        } catch (error) {
            return repondreErreur(res, error, 500, "Erreur lors de la récupération des congés")
        }
    }


    async getById(req: Request, res: Response) {
        try {
            const conge = await this.service.getByIdPourActeur(String(req.params.id), getAuthUser(req))

            return res.status(200).json(conge)

        } catch (error : any) {
            return repondreErreur(res, error, 500)
        }
    }


    async getByEmployeId(req: Request, res: Response) {
        try {
            const conges = await this.service.getByEmployeId(String(req.params.employeId), getAuthUser(req))
         return res.status(200).json(conges);

        } catch (error) {
            return repondreErreur(res, error, 500, "Erreur lors de la récupération des congés")
        }
    }


    async create(req: Request, res: Response) {
        try {
            const { employeId, dateDebut, dateFin, motif } = req.body
            const conge = await this.service.create(
                { employeId, dateDebut: new Date(dateDebut), dateFin: new Date(dateFin), motif },
                getAuthUser(req)
            )

            return res.status(201).json(conge)

        } catch (error: any) {
            return repondreErreur(res, error, 400)
        }
    }


    async update(req: Request, res: Response) {
        try {
            const data: any = {};

            if (req.body.dateDebut) {
                data.dateDebut = new Date(req.body.dateDebut);
            }

            if (req.body.dateFin) {
                data.dateFin = new Date(req.body.dateFin);
            }

            // Présent (même vide ou null) : remplace le motif ; absent : motif inchangé.
            if (req.body && "motif" in req.body) {
                data.motif = req.body.motif;
            }

            const conge = await this.service.update(String(req.params.id), data, getAuthUser(req));

            return res.status(200).json(conge);

        } catch (error: any) {
            return repondreErreur(res, error, 400)
        }
    }


    async delete(req: Request, res: Response) {
        try {
            await this.service.delete(String(req.params.id), getAuthUser(req));

            return res.status(204).send();

        } catch (error: any) {
            return repondreErreur(res, error, 500)
        }
    }


    async valider(req: Request, res: Response) {
        try {
            const conge = await this.service.valider(String(req.params.id), getAuthUser(req));

            return res.status(200).json(conge);

        } catch (error: any) {
            return repondreErreur(res, error, 500)
        }
    }


    async refuser(req: Request, res: Response) {
        try {
            const conge = await this.service.refuser(String(req.params.id), req.body?.motifRefus, getAuthUser(req));

            return res.status(200).json(conge);

        } catch (error: any) {
            return repondreErreur(res, error, 500)
        }
    }


}
