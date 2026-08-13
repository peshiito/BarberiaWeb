import { Role } from "./user.types";

export interface LoginInput {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: number;
    role: Role;
}
