import { Router } from "express";
import { Role } from "@prisma/client";
import { CongeController } from "./conge.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

const congeController = new CongeController();

router.use(authMiddleware);

// Les contrôles de propriété (employé concerné) sont faits dans CongeService.
router.get("/", requireRole(Role.ADMIN), congeController.getAll.bind(congeController));
router.get("/moi", congeController.getMine.bind(congeController));
router.get("/employe/:employeId", congeController.getByEmployeId.bind(congeController));
router.get("/:id", congeController.getById.bind(congeController));
router.post("/",congeController.create.bind(congeController));
router.put("/:id",congeController.update.bind(congeController));
router.delete("/:id",congeController.delete.bind(congeController));
router.patch("/:id/valider", requireRole(Role.ADMIN), congeController.valider.bind(congeController));
router.patch("/:id/refuser", requireRole(Role.ADMIN), congeController.refuser.bind(congeController));


export default router;
