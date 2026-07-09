export type AppointmentStatus = "active" | "cancelled" | "completed";

export interface Appointment {
    id: number;
    client_id: number;
    barber_id: number;
    schedule_id: number;
    date: string;
    time: string;
    status: AppointmentStatus;
    created_at: Date;
}

export interface AppointmentInput {
    client_id: number;
    barber_id: number;
    schedule_id: number;
    date: string;
    time: string;
}
