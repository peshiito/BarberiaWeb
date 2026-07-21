import { Router } from "express";
import { createBarber, getAllUsers, getFinancialSummary, getFinancialPeriod } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBarberSchema } from "../schemas/admin.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
    "/barbers",
    authenticate,
    authorize("admin", "admin_barber"),
    validate(createBarberSchema),
    asyncHandler(createBarber),
);
router.get("/users", authenticate, authorize("admin", "admin_barber"), asyncHandler(getAllUsers));
router.get("/finance/summary", authenticate, authorize("admin", "admin_barber"), asyncHandler(getFinancialSummary));
router.get("/finance/period", authenticate, authorize("admin", "admin_barber"), asyncHandler(getFinancialPeriod));

export default router;
