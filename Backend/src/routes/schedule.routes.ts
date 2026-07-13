import { Router } from "express";
import { createScheduleHandler, getMySchedules, getScheduleSlots } from "../controllers/schedule.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createScheduleSchema } from "../schemas/schedule.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("barber", "admin_barber"),
    validate(createScheduleSchema),
    asyncHandler(createScheduleHandler),
);

router.get("/mine", authenticate, authorize("barber", "admin_barber"), asyncHandler(getMySchedules));

router.get("/:barberId/:weekStart/slots", asyncHandler(getScheduleSlots));

export default router;
