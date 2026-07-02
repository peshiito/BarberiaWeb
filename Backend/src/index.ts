import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { apiRateLimiter } from "./config/rateLimit";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

// Middlewares
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
);
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rate limiting
app.use("/api", apiRateLimiter);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`🚀 Server: http://localhost:${env.PORT}`);
    console.log(`📝 API: http://localhost:${env.PORT}/api`);
    console.log(`📊 PHPMyAdmin: http://localhost:8080`);
});
