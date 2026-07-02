// backend/src/routes/index.ts
import { Router } from "express";
import adminRoutes from "./admin.routes";
import appointmentRoutes from "./appointment.routes";
import authRoutes from "./auth.routes";
import barberRoutes from "./barber.routes";
import clientRoutes from "./client.routes";
import photoRoutes from "./photo.routes";
import scheduleRoutes from "./schedule.routes";
import serviceRoutes from "./service.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/barber", barberRoutes);
router.use("/admin", adminRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/services", serviceRoutes);
router.use("/photos", photoRoutes);

export default router;
