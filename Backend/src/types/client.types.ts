export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ClientInput {
    first_name: string;
    last_name: string;
    phone: string;
    notes?: string | null;
}

export interface ClientUpdateInput {
    first_name?: string;
    last_name?: string;
    phone?: string;
    notes?: string;
}
