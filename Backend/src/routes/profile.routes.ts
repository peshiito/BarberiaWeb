import { Router } from "express";
import { changeMyPassword, getMyProfile, updateMyBio, updateMyProfileDetails } from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { changePasswordSchema, updateBioSchema, updateProfileDetailsSchema } from "../schemas/profile.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/me", authenticate, asyncHandler(getMyProfile));
router.patch("/me", authenticate, validate(updateBioSchema), asyncHandler(updateMyBio));
router.patch("/me/details", authenticate, validate(updateProfileDetailsSchema), asyncHandler(updateMyProfileDetails));
router.patch(
    "/me/password",
    staffActionsRateLimit,
    authenticate,
    validate(changePasswordSchema),
    asyncHandler(changeMyPassword),
);

export default router;
