import { Router } from "express";
import {
    cancelAppointmentByBarberHandler,
    cancelAppointmentHandler,
    completeAppointmentHandler,
    createAppointmentHandler,
    getBarberWeekAppointments,
    getMyAppointments,
} from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authenticateClient } from "../middlewares/client-auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAppointmentSchema } from "../schemas/appointment.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", authenticateClient, validate(createAppointmentSchema), asyncHandler(createAppointmentHandler));
router.patch("/:id/cancel", authenticateClient, asyncHandler(cancelAppointmentHandler));
router.get("/mine", authenticateClient, asyncHandler(getMyAppointments));

router.get(
    "/barber/week/:weekStart",
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(getBarberWeekAppointments),
);

router.patch(
    "/:id/complete",
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(completeAppointmentHandler),
);

router.patch(
    "/:id/cancel-by-barber",
    authenticate,
    authorize("barber", "admin_barber"),
    asyncHandler(cancelAppointmentByBarberHandler),
);
export default router;
