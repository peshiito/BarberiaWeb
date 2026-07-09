import { Router } from "express";
import { upload } from "../config/upload";
import { getMyPhotos, removePhoto, uploadPhoto } from "../controllers/photo.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorize("barber", "admin_barber"), upload.single("photo"), uploadPhoto);

router.get("/mine", authenticate, authorize("barber", "admin_barber"), getMyPhotos);
router.delete("/:id", authenticate, authorize("barber", "admin_barber"), removePhoto);

export default router;
