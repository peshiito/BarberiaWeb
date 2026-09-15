import { Router } from "express";
import {
    createClientByStaff,
    getClientByIdHandler,
    getClientHistory,
    listClients,
    searchClients,
    updateClientByStaff,
} from "../controllers/client.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createClientSchema, updateClientSchema } from "../schemas/client.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const staffOnly = [authenticate, authorize("admin", "barber", "admin_barber"), staffActionsRateLimit];

router.get("/", ...staffOnly, asyncHandler(listClients));
router.get("/search", ...staffOnly, asyncHandler(searchClients));
router.post("/", ...staffOnly, validate(createClientSchema), asyncHandler(createClientByStaff));
router.get("/:id", ...staffOnly, asyncHandler(getClientByIdHandler));
router.get("/:id/history", ...staffOnly, asyncHandler(getClientHistory));
router.patch("/:id", ...staffOnly, validate(updateClientSchema), asyncHandler(updateClientByStaff));

export default router;
