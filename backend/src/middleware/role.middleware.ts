import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { getAuthUser } from "./auth.middleware";

// À placer après authMiddleware : refuse (403) si le rôle du token n'est pas autorisé.
export const requireRole = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = getAuthUser(req);

        if (!user) {
            return res.status(401).json({ message: "token manquant" });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Accès refusé : rôle insuffisant" });
        }

        next();
    };
};
