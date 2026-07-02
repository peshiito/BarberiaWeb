import { Router } from "express";
import { ServiceController } from "../controllers/service.controller";
import { authMiddleware, barberOnly } from "../middlewares/auth.middleware";
import { validate, validators } from "../middlewares/validation.middleware";

const router = Router();

router.use(authMiddleware);
router.use(barberOnly);

router.post("/", validators.createService, validate, ServiceController.createService);
router.put("/:id", validators.createService, validate, ServiceController.updateService);
router.delete("/:id", ServiceController.deleteService);
router.get("/", ServiceController.getServices);

export default router;
