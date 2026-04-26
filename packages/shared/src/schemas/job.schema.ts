import { z } from 'zod';

export const JobSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string(),
    department: z.string(),
    location: z.string(),
    type: z.string(),
    description: z.string().optional(),
    active: z.boolean().default(true),
    created_at: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
