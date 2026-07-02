import { NextFunction, Request, Response } from "express";
import pool from "../config/db";
import { env } from "../config/env";

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
        return next();
    }

    const idempotencyKey = (req.headers["idempotency-key"] as string) || req.body.idempotencyKey;

    if (!idempotencyKey) {
        return res.status(400).json({ error: "Idempotency-Key requerida" });
    }

    pool.execute("SELECT response FROM idempotency_keys WHERE key_value = ? AND expires_at > NOW()", [idempotencyKey])
        .then(([rows]: any) => {
            if (rows.length > 0) {
                return res.status(200).json(JSON.parse(rows[0].response));
            }

            const originalSend = res.send;
            res.send = function (body: any) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    pool.execute(
                        "INSERT INTO idempotency_keys (key_value, response, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))",
                        [idempotencyKey, JSON.stringify(body), env.IDEMPOTENCY_EXPIRY],
                    ).catch(console.error);
                }
                return originalSend.call(this, body);
            };

            next();
        })
        .catch(() => {
            next();
        });
};
