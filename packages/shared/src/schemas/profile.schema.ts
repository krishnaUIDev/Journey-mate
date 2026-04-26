import { z } from 'zod';

export const ProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    avatar_url: z.string().optional(),
    avg_rating: z.number().default(5.0),
    review_count: z.number().default(0),
    languages: z.array(z.string()).default(['English']),
    specialty: z.string().default('Companion'),
    badges: z.array(z.string()).default([]),
    is_verified: z.boolean().default(false),
    created_at: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
