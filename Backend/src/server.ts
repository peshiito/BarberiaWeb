import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];
const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
