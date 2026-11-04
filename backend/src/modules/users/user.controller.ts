import { Request, Response } from "express";
import { UserService } from "./user.service";
import { HttpError } from "../../errors/http-error";
import { ChangerRoleDto, LierEmployeDto } from "./user.dto";
import { getAuthUser } from "../../middleware/auth.middleware";

export class UserController {

    private service = new UserService();

    async getAll(req: Request, res: Response) {
        try {
            const users = await this.service.getAll();

            return res.status(200).json(users);

        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
        }
    }


    async lierEmploye(req: Request, res: Response) {
        try {
            const { employeId } = (req.body ?? {}) as Partial<LierEmployeDto>;
            const user = await this.service.lierEmploye(String(req.params.id), employeId);

            return res.status(200).json(user);

        } catch (error: any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erreur lors de la liaison du compte à l'employé" });
        }
    }


    async changerRole(req: Request, res: Response) {
        try {
            const { role } = (req.body ?? {}) as Partial<ChangerRoleDto>;
            const user = await this.service.changerRole(String(req.params.id), role, getAuthUser(req));

            return res.status(200).json(user);

        } catch (error: any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erreur lors du changement de rôle" });
        }
    }
}
