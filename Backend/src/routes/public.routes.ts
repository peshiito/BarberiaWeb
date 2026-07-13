import { Router } from "express";
import { getPublicBarbers } from "../controllers/public.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/barbers", asyncHandler(getPublicBarbers));

export default router;
