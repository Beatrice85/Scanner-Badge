import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const TAILLE_MAX_PHOTO = 20 * 1024 * 1024; // 20 Mo

// Réception d'un seul fichier « photo » en mémoire (il est ensuite envoyé au stockage,
// jamais écrit sur le disque du serveur). Erreurs renvoyées au format { message }.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAILLE_MAX_PHOTO, files: 1 },
}).single("photo");

export function recevoirPhoto(req: Request, res: Response, next: NextFunction) {
    upload(req, res, (err: unknown) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "La photo ne doit pas dépasser 20 Mo" });
            }
            return res.status(400).json({ message: "Envoyez une seule photo dans le champ « photo »" });
        }
        return res.status(400).json({ message: "Fichier reçu invalide" });
    });
}
