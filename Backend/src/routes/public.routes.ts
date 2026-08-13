import { Router } from "express";
import { getPublicBarbers } from "../controllers/public.controller";
import { publicRateLimit } from "../middlewares/rate-limit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/barbers", publicRateLimit, asyncHandler(getPublicBarbers));

export default router;
