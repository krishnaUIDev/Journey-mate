import { z } from 'zod';

export const SquadLocationSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    user_id: z.string(),
    user_name: z.string(),
    lat: z.number(),
    lng: z.number(),
    updated_at: z.string().optional(),
});

export type SquadLocation = z.infer<typeof SquadLocationSchema>;
