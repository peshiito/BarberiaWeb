import { Router } from "express";
import {
    cancelAppointmentHandler,
    createAppointmentHandler,
    getBarberWeekAppointments,
    getMyAppointments,
} from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authenticateClient } from "../middlewares/client-auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticateClient, createAppointmentHandler);
router.patch("/:id/cancel", authenticateClient, cancelAppointmentHandler);
router.get("/mine", authenticateClient, getMyAppointments);

router.get("/barber/week/:weekStart", authenticate, authorize("barber", "admin_barber"), getBarberWeekAppointments);

export default router;
