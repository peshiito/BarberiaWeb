import { Router } from "express";
import {
    createServiceHandler,
    listServicesAdminHandler,
    listServicesByBarberHandler,
    updateServiceHandler,
} from "../controllers/service.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createServiceSchema, updateServiceSchema } from "../schemas/service.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(staffActionsRateLimit);

router.post(
    "/",
    authenticate,
    authorize("admin", "admin_barber"),
    validate(createServiceSchema),
    asyncHandler(createServiceHandler),
);

router.get("/", authenticate, authorize("admin", "admin_barber"), asyncHandler(listServicesAdminHandler));

router.patch(
    "/:id",
    authenticate,
    authorize("admin", "admin_barber"),
    validate(updateServiceSchema),
    asyncHandler(updateServiceHandler),
);

// Cualquier rol staff (no solo admin): lo usa tanto un barbero armando su
// propio turno manual como un admin armando uno para otro barbero — ver
// AppointmentFormModal en el dashboard.
router.get(
    "/barber/:barberId",
    authenticate,
    authorize("admin", "admin_barber", "barber"),
    asyncHandler(listServicesByBarberHandler),
);

export default router;
