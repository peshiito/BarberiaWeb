import { Role } from "./user.types";

export interface RegisterInput {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: Role;
    bio?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: number;
    role: Role;
}
