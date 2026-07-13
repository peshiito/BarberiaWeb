import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../schemas/auth.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;
