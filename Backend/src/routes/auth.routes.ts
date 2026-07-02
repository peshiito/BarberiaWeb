import { Router } from "express";
import { authRateLimiter } from "../config/rateLimit";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate, validators } from "../middlewares/validation.middleware";

const router = Router();

router.post("/register/user", authRateLimiter, validators.registerUser, validate, AuthController.registerUser);
router.post("/register/client", authRateLimiter, validators.registerClient, validate, AuthController.registerClient);
router.post("/login/user", authRateLimiter, validators.login, validate, AuthController.loginUser);
router.post("/login/client", authRateLimiter, validators.loginClient, validate, AuthController.loginClient);
router.get("/me", authMiddleware, AuthController.getMe);

export default router;
