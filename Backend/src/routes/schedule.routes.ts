import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { authMiddleware, barberOnly } from "../middlewares/auth.middleware";
import { validate, validators } from "../middlewares/validation.middleware";

const router = Router();

router.use(authMiddleware);
router.use(barberOnly);

router.post("/week", validators.createSchedule, validate, ScheduleController.createWeeklySchedule);
router.get("/", ScheduleController.getBarberSchedules);

export default router;
