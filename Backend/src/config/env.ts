import dotenv from "dotenv";
dotenv.config();

export const env = {
    PORT: parseInt(process.env.PORT || "3000"),
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "root",
    DB_NAME: process.env.DB_NAME || "sistema_barberia",
    JWT_SECRET: process.env.JWT_SECRET || "claveSuperSegura123456789!@#$%",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12"),
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "15"),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    IDEMPOTENCY_EXPIRY: parseInt(process.env.IDEMPOTENCY_EXPIRY || "3600"),
    UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
    ALLOWED_EXTENSIONS: process.env.ALLOWED_EXTENSIONS?.split(",") || ["jpg", "jpeg", "png", "webp"],
};
