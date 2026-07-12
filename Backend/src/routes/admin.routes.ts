import { Router } from "express";
import { createBarber, getAllUsers, getFinancialSummary } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/barbers", authenticate, authorize("admin", "admin_barber"), createBarber);
router.get("/users", authenticate, authorize("admin", "admin_barber"), getAllUsers);
router.get("/finance", authenticate, authorize("admin", "admin_barber"), getFinancialSummary);

export default router;
