import { z } from 'zod';

export const JourneySchema = z.object({
    user_id: z.string().optional(),
    origin: z.string().min(2, "Origin is required"),
    destination: z.string().min(2, "Destination is required"),
    date: z.string(),
    flight_number: z.string().optional().nullable(),
    contact_info: z.string().optional().nullable(),
    contact_method: z.enum(['whatsapp', 'instagram', 'email']).optional().nullable(),
    description: z.string().optional().nullable(),
    user_name: z.string(),
    user_avatar: z.string().optional().nullable(),
    user_rating: z.number().optional().nullable(),
    user_verified: z.boolean().optional().nullable(),
    user_verification_tier: z.enum(['bronze', 'silver', 'gold']).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    group_name: z.string().optional().nullable(),
    group_avatar: z.string().optional().nullable(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional().default('upcoming'),
    airline_name: z.string().optional().nullable(),
    airline_iata: z.string().optional().nullable(),
    boarding_pass_url: z.string().optional().nullable(),
    layovers: z.array(z.string()).optional().nullable(),
    route_data: z.record(z.array(z.number())).optional().nullable(),
    luggage_capacity: z.string().optional().nullable(),
});

export type Journey = z.infer<typeof JourneySchema>;
