import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { adminOnly, authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get("/dashboard", AdminController.getDashboardStats);
router.get("/barbers", AdminController.getAllBarbers);
router.get("/branches", AdminController.getAllBranches);
router.post("/branches", AdminController.createBranch);
router.post("/barbers", AdminController.createBarber);
router.put("/barbers/:id/deactivate", AdminController.deactivateBarber);
router.get("/clients", AdminController.getAllClients);

export default router;
