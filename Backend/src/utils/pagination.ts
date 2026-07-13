import { Request } from "express";

export interface Pagination {
    page: number;
    limit: number;
    offset: number;
}

export const getPagination = (req: Request): Pagination => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};
