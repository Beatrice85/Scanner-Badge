import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { getAuthUser } from "../../middleware/auth.middleware";
import { HttpError } from "../../errors/http-error";

export class AuthController {

    private service : AuthService;
    constructor() {
      this.service = new AuthService()
    }

    async register(req: Request, res: Response) {
        try{
            const { nom, email, password, role } = req.body ?? {};
            const user = await this.service.register({ nom, email, password, role });
            res.status(200).json(user)
        } catch (error: any) {
            if (error instanceof HttpError) {
                // Validation (rôle invalide) : { message } comme le reste de l'API.
                return res.status(error.status).json({ message: error.message });
            }
            console.log("ERREUR REGISTER:", error)
            res.status(400).json({message: 'Erreur lors de la registration', 
                error: error.message||error})
        }
    }

    async login(req: Request, res: Response) {
        try {

            const { email, password } = req.body;

            const result = await this.service.login({ email, password });

            res.status(200).json(result);

        }catch (error : any) {
            console.log(error)
            res.status(400).json({message: 'Erreur lors de la connexion', error: error.message})
        }
    }

    async me(req: Request, res: Response) {
        try {
            const user = await this.service.me(getAuthUser(req).id);
            return res.status(200).json(user);
        } catch (error: any) {
            return res.status(error instanceof HttpError ? error.status : 500).json({ message: error.message });
        }
    }
}