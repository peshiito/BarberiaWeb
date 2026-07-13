import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import pool from "../config/db";

const run = async () => {
    const email = process.argv[2];
    const password = process.argv[3];
    const firstName = process.argv[4] || "Admin";
    const lastName = process.argv[5] || "Root";

    if (!email || !password) {
        console.log("Uso: ts-node src/scripts/seed-admin.ts email password [nombre] [apellido]");
        process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES (?, ?, ?, ?, 'admin')`,
        [firstName, lastName, email, password_hash],
    );

    console.log("Admin creado:", email);
    process.exit(0);
};

run();
