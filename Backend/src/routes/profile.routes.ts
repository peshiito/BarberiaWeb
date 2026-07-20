import { Router } from "express";
import { getMyProfile, updateMyBio } from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateBioSchema } from "../schemas/profile.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/me", authenticate, asyncHandler(getMyProfile));
router.patch("/me", authenticate, validate(updateBioSchema), asyncHandler(updateMyBio));

export default router;
