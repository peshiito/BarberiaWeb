import { Router } from "express";
import {
    cancelAppointmentByAdminHandler,
    cancelAppointmentByBarberHandler,
    cancelAppointmentHandler,
    completeAppointmentHandler,
    createAppointmentByAdminHandler,
    createAppointmentByBarberHandler,
    createAppointmentHandler,
    getBarberWeekAppointments,
    getBarberWeekAppointmentsForAdmin,
    getMyAppointments,
    updateAppointmentByAdminHandler,
} from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authenticateClient } from "../middlewares/client-auth.middleware";
import { appointmentsRateLimit, staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createAppointmentByAdminSchema,
    createAppointmentByBarberSchema,
    createAppointmentSchema,
    updateAppointmentByAdminSchema,
} from "../schemas/appointment.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
    "/",
    appointmentsRateLimit,
    authenticateClient,
    validate(createAppointmentSchema),
    asyncHandler(createAppointmentHandler),
);
router.patch("/:id/cancel", appointmentsRateLimit, authenticateClient, asyncHandler(cancelAppointmentHandler));
router.get("/mine", authenticateClient, asyncHandler(getMyAppointments));

router.get(
    "/barber/week/:weekStart",
    staffActionsRateLimit,
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(getBarberWeekAppointments),
);

router.patch(
    "/:id/complete",
    staffActionsRateLimit,
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(completeAppointmentHandler),
);

router.patch(
    "/:id/cancel-by-barber",
    staffActionsRateLimit,
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(cancelAppointmentByBarberHandler),
);

router.post(
    "/by-admin",
    staffActionsRateLimit,
    authenticate,
    authorize("admin", "admin_barber"),
    validate(createAppointmentByAdminSchema),
    asyncHandler(createAppointmentByAdminHandler),
);

router.post(
    "/by-barber",
    staffActionsRateLimit,
    authenticate,
    authorize("barber", "admin_barber"),
    validate(createAppointmentByBarberSchema),
    asyncHandler(createAppointmentByBarberHandler),
);

router.patch(
    "/:id/admin",
    staffActionsRateLimit,
    authenticate,
    authorize("admin", "admin_barber"),
    validate(updateAppointmentByAdminSchema),
    asyncHandler(updateAppointmentByAdminHandler),
);

router.patch(
    "/:id/cancel-by-admin",
    staffActionsRateLimit,
    authenticate,
    authorize("admin", "admin_barber"),
    asyncHandler(cancelAppointmentByAdminHandler),
);

router.get(
    "/barber/:barberId/week/:weekStart",
    staffActionsRateLimit,
    authenticate,
    authorize("admin", "admin_barber"),
    asyncHandler(getBarberWeekAppointmentsForAdmin),
);

export default router;
