import { Router } from "express";
import { getPublicBarbers, getPublicServices } from "../controllers/public.controller";
import { publicRateLimit } from "../middlewares/rate-limit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/barbers", publicRateLimit, asyncHandler(getPublicBarbers));
router.get("/services", publicRateLimit, asyncHandler(getPublicServices));

export default router;
