import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import { appointmentsRateLimit, authRateLimit } from "./middlewares/rate-limit.middleware";
import adminRoutes from "./routes/admin.routes";
import appointmentRoutes from "./routes/appointment.routes";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import photoRoutes from "./routes/photo.routes";
import publicRoutes from "./routes/public.routes";
import scheduleRoutes from "./routes/schedule.routes";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

app.use(helmet());
app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : "http://localhost:5173",
    }),
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/clients", authRateLimit, clientRoutes);
app.use("/api/appointments", appointmentsRateLimit, appointmentRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
