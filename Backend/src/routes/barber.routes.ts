import { Router } from "express";
import { BarberController } from "../controllers/barber.controller";
import { authMiddleware, barberOnly } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(barberOnly);

router.get("/profile", BarberController.getMyProfile);
router.get("/schedule", BarberController.getMySchedule);
router.get("/appointments", BarberController.getMyAppointments);
router.get("/services", BarberController.getMyServices);
router.put("/appointments/:id/complete", BarberController.completeAppointment);
router.put("/appointments/:id/no-show", BarberController.noShowAppointment);

export default router;
