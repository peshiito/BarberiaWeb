export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    password_hash: string | null;
    photo_url: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export type SafeClient = Omit<Client, "password_hash">;

export interface ClientInput {
    first_name: string;
    last_name: string;
    phone: string;
    password_hash?: string | null;
}

export interface ClientUpdateInput {
    first_name?: string;
    last_name?: string;
    phone?: string;
    notes?: string;
}

export interface ClientJwtPayload {
    clientId: number;
    type: "client";
}
