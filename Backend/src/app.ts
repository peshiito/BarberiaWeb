import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import { authRateLimit } from "./middlewares/rate-limit.middleware";
import adminRoutes from "./routes/admin.routes";
import appointmentRoutes from "./routes/appointment.routes";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import photoRoutes from "./routes/photo.routes";
import profileRoutes from "./routes/profile.routes";
import publicRoutes from "./routes/public.routes";
import scheduleRoutes from "./routes/schedule.routes";
import serviceRoutes from "./routes/service.routes";

const app = express();

// Necesario detrás de cualquier reverse proxy/balanceador (Render, Railway,
// nginx, etc.): sin esto, express-rate-limit cuenta todas las requests bajo
// la IP del proxy en vez de la del cliente real (rate limit inútil), y
// req.secure/x-forwarded-proto no reflejan el protocolo real del cliente.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

app.use(helmet());

// Fuerza HTTPS solo en producción — en dev local (http://localhost) esto
// redirigiría en loop porque no hay TLS. Depende de "trust proxy" arriba
// para leer x-forwarded-proto correctamente detrás del hosting.
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.secure || req.headers["x-forwarded-proto"] === "https") {
            return next();
        }
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    });
}
app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : "http://localhost:5173",
    }),
);
app.use(express.json({ limit: "1mb" }));
// Las fotos de barbero son recursos públicos pensados para embeberse en
// frontends de otro origen (landing pública, dashboard). helmet() aplica
// Cross-Origin-Resource-Policy: same-origin por defecto a toda la app, lo
// que bloquea silenciosamente <img> cross-origin incluso con CORS habilitado.
// Se relaja solo para /uploads, sin tocar el resto de los headers de la API.
app.use(
    "/uploads",
    (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    },
    express.static(path.join(__dirname, "uploads")),
);

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/services", serviceRoutes);

app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
