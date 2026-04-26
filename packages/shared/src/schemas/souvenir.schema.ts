import { z } from 'zod';

export const SouvenirSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    user_id: z.string(),
    type: z.enum(['photo', 'note']),
    content: z.string(),
    caption: z.string().optional(),
    created_at: z.string().optional(),
});

export type Souvenir = z.infer<typeof SouvenirSchema>;
