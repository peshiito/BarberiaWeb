import { Router } from "express";
import { registerOrLoginClient } from "../controllers/client.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerClientSchema } from "../schemas/client.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", validate(registerClientSchema), asyncHandler(registerOrLoginClient));

export default router;
