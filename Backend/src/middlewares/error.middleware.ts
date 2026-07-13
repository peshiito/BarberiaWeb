import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Duplicate entry" });
    }

    return res.status(500).json({ error: "Internal server error" });
};
