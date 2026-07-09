import { Router } from "express";
import { getPublicBarbers } from "../controllers/public.controller";

const router = Router();

router.get("/barbers", getPublicBarbers);

export default router;
