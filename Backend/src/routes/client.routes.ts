import { Router } from "express";
import { authMiddleware, clientOnly } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(clientOnly);

// Aquí irán endpoints específicos para clientes
// Por ahora solo tenemos /me en auth

export default router;
