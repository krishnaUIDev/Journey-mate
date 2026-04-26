import { z } from 'zod';

export const JourneyRequestSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    requester_id: z.string(),
    requester_name: z.string(),
    requester_avatar: z.string().optional(),
    status: z.enum(['pending', 'accepted', 'rejected']),
    message: z.string().optional(),
    rating: z.number().optional(),
    verified_ticket: z.boolean().optional(),
    audio_url: z.string().optional(),
    boarding_pass_url: z.string().optional(),
    created_at: z.string().optional(),
});

export type JourneyRequest = z.infer<typeof JourneyRequestSchema>;
