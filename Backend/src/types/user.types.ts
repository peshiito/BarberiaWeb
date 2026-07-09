export type Role = "admin" | "barber" | "admin_barber";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: Role;
    bio: string | null;
    created_at: Date;
}

export interface UserInput {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: Role;
    bio?: string;
}
