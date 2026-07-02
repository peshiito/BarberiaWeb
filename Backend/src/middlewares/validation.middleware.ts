import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Error de validación",
            details: errors.array(),
        });
    }
    next();
};

export const validators = {
    registerUser: [
        body("email").isEmail().normalizeEmail(),
        body("password")
            .isLength({ min: 8 })
            .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
        body("fullName").isLength({ min: 2, max: 100 }),
        body("role").isIn(["admin", "barber"]),
    ],

    registerClient: [
        body("fullName").isLength({ min: 2, max: 100 }),
        body("phone").matches(/^[0-9]{7,15}$/),
        body("email").optional().isEmail().normalizeEmail(),
        body("password")
            .isLength({ min: 8 })
            .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
    ],

    login: [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 1 })],

    loginClient: [body("phone").matches(/^[0-9]{7,15}$/), body("password").isLength({ min: 1 })],

    createAppointment: [
        body("barberId").isInt({ min: 1 }),
        body("branchId").isInt({ min: 1 }),
        body("serviceId").isInt({ min: 1 }),
        body("date").isISO8601().toDate(),
        body("time").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    ],

    createSchedule: [
        body("branchId").isInt({ min: 1 }),
        body("weekStartDate").isISO8601().toDate(),
        body("weekEndDate").isISO8601().toDate(),
        body("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body("slotInterval").isInt({ min: 15, max: 120 }),
        body("days").isArray({ min: 1 }),
        body("days.*.dayOfWeek").isInt({ min: 1, max: 7 }),
        body("days.*.isWorking").isBoolean(),
    ],

    createService: [
        body("name").isLength({ min: 2, max: 100 }),
        body("duration").isInt({ min: 5, max: 240 }),
        body("price").isFloat({ min: 0 }),
    ],

    uploadPhoto: [
        body("title").optional().isLength({ max: 255 }),
        body("description").optional().isLength({ max: 500 }),
        body("isProfile").optional().isBoolean(),
    ],
};
