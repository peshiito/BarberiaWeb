import { z } from "zod";
import { calendarDateField, timeField } from "./common";

export const createScheduleSchema = z
    .object({
        week_start: calendarDateField,
        work_days: z.string().min(3).max(100),
        start_time: timeField,
        end_time: timeField,
        slot_duration_minutes: z.number().int().min(5).max(240),
    })
    .refine(data => data.start_time < data.end_time, {
        message: "start_time must be before end_time",
        path: ["end_time"],
    });
