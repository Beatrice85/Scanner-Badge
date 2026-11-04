import { Router } from "express";
import { Role } from "@prisma/client";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

const controller = new UserController();

router.use(authMiddleware, requireRole(Role.ADMIN));

router.get("/", controller.getAll.bind(controller));
router.patch("/:id/employe", controller.lierEmploye.bind(controller));
router.patch("/:id/role", controller.changerRole.bind(controller));

export default router;
