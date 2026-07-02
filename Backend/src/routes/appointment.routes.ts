import { Router } from "express";
import { appointmentRateLimiter } from "../config/rateLimit";
import { AppointmentController } from "../controllers/appointment.controller";
import { authMiddleware, clientOnly } from "../middlewares/auth.middleware";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware";
import { validate, validators } from "../middlewares/validation.middleware";

const router = Router();

router.get("/available-slots", AppointmentController.getAvailableSlots);
router.post(
    "/",
    authMiddleware,
    clientOnly,
    appointmentRateLimiter,
    idempotencyMiddleware,
    validators.createAppointment,
    validate,
    AppointmentController.createAppointment,
);
router.put("/:id/cancel", authMiddleware, clientOnly, AppointmentController.cancelAppointment);
router.get("/my", authMiddleware, clientOnly, AppointmentController.getMyAppointments);

export default router;
