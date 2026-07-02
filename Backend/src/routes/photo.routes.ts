import { Router } from "express";
import { PhotoController } from "../controllers/photo.controller";
import { authMiddleware, barberOnly } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { validate, validators } from "../middlewares/validation.middleware";

const router = Router();

router.use(authMiddleware);
router.use(barberOnly);

router.post("/upload", uploadSingle, validators.uploadPhoto, validate, PhotoController.uploadPhoto);
router.get("/", PhotoController.getPhotos);
router.delete("/:id", PhotoController.deletePhoto);
router.put("/:id/profile", PhotoController.setProfilePhoto);

export default router;
