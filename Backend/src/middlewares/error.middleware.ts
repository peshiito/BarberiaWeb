import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error: "Registro duplicado",
        });
    }

    if (err.code === "ER_NO_REFERENCED_ROW") {
        return res.status(400).json({
            error: "Referencia inválida",
        });
    }

    res.status(500).json({
        error: "Error interno del servidor",
    });
};
