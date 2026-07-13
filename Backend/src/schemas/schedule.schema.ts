import { z } from "zod";

export const createScheduleSchema = z.object({
    week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    work_days: z.string().min(3).max(100),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    slot_duration_minutes: z.number().int().min(5).max(240),
});
