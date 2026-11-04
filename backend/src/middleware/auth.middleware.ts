import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AuthRepository } from "../modules/auth/auth.repository";

// Utilisateur authentifié, disponible dans req.user après authMiddleware.
// role et employeId sont relus en base à chaque requête (pas ceux du token) :
// un changement de rôle ou de liaison s'applique immédiatement.
export interface AuthPayload {
    id: string;
    email: string;
    role: Role;
    employeId: string | null;
}

export function getAuthUser(req: Request): AuthPayload {
    return (req as any).user as AuthPayload;
}

type LecteurUtilisateur = Pick<AuthRepository, "findUserById">;

// Fabrique injectable (tests) ; authMiddleware utilise le vrai repository.
export function creerAuthMiddleware(repository: LecteurUtilisateur = new AuthRepository()) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "token manquant" });
        }

        // 1. Vérifier le format "Bearer TOKEN"
        const parts = authHeader.split(" ");
        if (parts.length!== 2 || parts[0]!== "Bearer" || !parts[1]) {
            return res.status(401).json({ message: "Format du token invalide. Utilisez: Bearer TOKEN" });
        }

        const token = parts[1];

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET manquant dans.env");
            return res.status(500).json({ message: "Erreur serveur: JWT_SECRET manquant" }); // 500 pas 401
        }

        // 2. Vérifier la signature et l'expiration du token
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "token expiré" });
            }
            return res.status(401).json({ message: "token invalide" });
        }

        if (!decoded || typeof decoded.id !== "string") {
            return res.status(401).json({ message: "token invalide" });
        }

        // 3. Relire le compte en base : rôle et employé à jour, compte supprimé refusé.
        try {
            const user = await repository.findUserById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: "compte introuvable" });
            }

            const authUser: AuthPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
                employeId: user.employeId
            };

            (req as any).user = authUser;

        } catch (error) {
            console.error("Erreur lors de la lecture du compte authentifié", error);
            return res.status(500).json({ message: "Erreur serveur lors de l'authentification" });
        }

        next();
    };
}

export const authMiddleware = creerAuthMiddleware();
