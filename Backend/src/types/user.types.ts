export type Role = "admin" | "barber" | "admin_barber";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: Role;
    bio: string | null;
    earnings_split_percentage: number;
    phone: string | null;
    specialties: string | null;
    social_media: string | null;
    birth_date: string | null;
    address: string | null;
    created_at: Date;
}

export interface UserInput {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: Role;
    bio?: string;
    earnings_split_percentage?: number;
    phone?: string;
    specialties?: string[];
    social_media?: string;
    birth_date?: string;
    address?: string;
}
