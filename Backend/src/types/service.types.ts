export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    active: boolean;
    created_at: Date;
}

export interface ServiceInput {
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    active?: boolean;
}

export interface ServiceUpdateInput {
    name?: string;
    description?: string;
    price?: number;
    duration_minutes?: number;
    active?: boolean;
}
