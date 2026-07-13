import { Router } from "express";
import { upload } from "../config/upload";
import { getMyPhotos, removePhoto, uploadPhoto } from "../controllers/photo.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", authenticate, authorize("barber", "admin_barber"), upload.single("photo"), asyncHandler(uploadPhoto));

router.get("/mine", authenticate, authorize("barber", "admin_barber"), asyncHandler(getMyPhotos));
router.delete("/:id", authenticate, authorize("barber", "admin_barber"), asyncHandler(removePhoto));

export default router;
