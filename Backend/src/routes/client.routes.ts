import { Router } from "express";
import { registerOrLoginClient } from "../controllers/client.controller";

const router = Router();

router.post("/register", registerOrLoginClient);

export default router;
