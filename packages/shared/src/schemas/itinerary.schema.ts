import { z } from 'zod';

export const ItineraryItemSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(['meetup', 'activity', 'layover', 'food', 'transport']),
    start_time: z.string().optional(),
    location: z.string().optional(),
    created_by: z.string(),
    created_at: z.string().optional(),
});

export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;
