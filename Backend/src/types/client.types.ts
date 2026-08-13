export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    created_at: Date;
    updated_at: Date;
}

export interface ClientInput {
    first_name: string;
    last_name: string;
    phone: string;
}

export interface ClientUpdateInput {
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export interface ClientJwtPayload {
    clientId: number;
    type: "client";
}
