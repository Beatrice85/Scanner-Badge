import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { recevoirPhoto } from "../../middleware/photo.middleware";

const router = Router();

const controller = new AuthController();

router.post("/register", controller.register.bind(controller));
router.post("/login", controller.login.bind(controller));
router.get("/me", authMiddleware, controller.me.bind(controller));
// Photo de profil du compte connecté (multipart/form-data, champ « photo »)
router.put("/me/photo", authMiddleware, recevoirPhoto, controller.changerPhoto.bind(controller));
router.delete("/me/photo", authMiddleware, controller.supprimerPhoto.bind(controller));

export default router;
