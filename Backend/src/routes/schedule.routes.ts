import { Router } from "express";
import { createScheduleHandler, getMySchedules, getScheduleSlots } from "../controllers/schedule.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorize("barber", "admin_barber"), createScheduleHandler);

router.get("/mine", authenticate, authorize("barber", "admin_barber"), getMySchedules);

router.get("/:barberId/:weekStart/slots", getScheduleSlots);

export default router;
