import cors from "cors";
import express from "express";
import path from "path";
import appointmentRoutes from "./routes/appointment.routes";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import photoRoutes from "./routes/photo.routes";
import publicRoutes from "./routes/public.routes";
import scheduleRoutes from "./routes/schedule.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/public", publicRoutes);

export default app;
