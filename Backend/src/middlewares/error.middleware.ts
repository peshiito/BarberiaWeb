import { NextFunction, Request, Response } from "express";
import multer from "multer";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }

    if (err.message === "Invalid file type") {
        return res.status(400).json({ error: err.message });
    }

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Duplicate entry" });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
        return res.status(400).json({ error: "Invalid reference to a related resource" });
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Malformed JSON body" });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Payload too large" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
};
