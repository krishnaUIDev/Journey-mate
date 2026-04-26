import { z } from 'zod';

export const KudosSchema = z.object({
    id: z.string().uuid().optional(),
    reviewer_id: z.string(),
    reviewee_id: z.string(),
    journey_id: z.string(),
    content: z.string(),
    type: z.enum(['positive', 'neutral', 'negative']),
    badges: z.array(z.string()).optional(),
    created_at: z.string().optional(),
});

export type Kudos = z.infer<typeof KudosSchema>;
