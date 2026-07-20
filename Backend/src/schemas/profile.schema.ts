import { z } from "zod";

export const updateBioSchema = z.object({
    bio: z.string().max(1000),
});
