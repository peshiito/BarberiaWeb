export interface Schedule {
    id: number;
    barber_id: number;
    week_start: string;
    work_days: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    created_at: Date;
}

export interface ScheduleInput {
    barber_id: number;
    week_start: string;
    work_days: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
}
