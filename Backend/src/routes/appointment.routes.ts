import { Router } from "express";
import {
    cancelAppointmentByAdminHandler,
    cancelAppointmentByBarberHandler,
    completeAppointmentHandler,
    createAppointmentByAdminHandler,
    createAppointmentByBarberHandler,
    createAppointmentHandler,
    getBarberWeekAppointments,
    getBarberWeekAppointmentsForAdmin,
    updateAppointmentByAdminHandler,
} from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { appointmentsRateLimit, staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    completeAppointmentSchema,
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
    validate(createAppointmentSchema),
    asyncHandler(createAppointmentHandler),
);

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
    validate(completeAppointmentSchema),
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
