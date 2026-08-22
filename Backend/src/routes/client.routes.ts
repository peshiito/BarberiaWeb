import { Router } from "express";
import { upload } from "../config/upload";
import {
    claimLegacyClient,
    createClientByStaff,
    getClientByIdHandler,
    getClientHistory,
    listClients,
    loginClient,
    registerClient,
    searchClients,
    updateClientByStaff,
    updateMyClientProfile,
    uploadClientPhoto,
} from "../controllers/client.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authenticateClient } from "../middlewares/client-auth.middleware";
import { clientLoginRateLimit, clientRegisterRateLimit, staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { claimClientSchema, createClientSchema, loginClientSchema, registerClientSchema, updateClientSchema } from "../schemas/client.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", clientRegisterRateLimit, validate(registerClientSchema), asyncHandler(registerClient));
router.post("/login", clientLoginRateLimit, validate(loginClientSchema), asyncHandler(loginClient));
router.post("/claim", clientLoginRateLimit, validate(claimClientSchema), asyncHandler(claimLegacyClient));

router.patch("/me", clientLoginRateLimit, authenticateClient, validate(updateClientSchema), asyncHandler(updateMyClientProfile));
router.post("/me/photo", clientLoginRateLimit, authenticateClient, upload.single("photo"), asyncHandler(uploadClientPhoto));

const staffOnly = [authenticate, authorize("admin", "barber", "admin_barber"), staffActionsRateLimit];

router.get("/", ...staffOnly, asyncHandler(listClients));
router.get("/search", ...staffOnly, asyncHandler(searchClients));
router.post("/", ...staffOnly, validate(createClientSchema), asyncHandler(createClientByStaff));
router.get("/:id", ...staffOnly, asyncHandler(getClientByIdHandler));
router.get("/:id/history", ...staffOnly, asyncHandler(getClientHistory));
router.patch("/:id", ...staffOnly, validate(updateClientSchema), asyncHandler(updateClientByStaff));

export default router;
