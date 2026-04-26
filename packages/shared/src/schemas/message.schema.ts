import { z } from 'zod';

export const MessageSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    sender_id: z.string(),
    sender_name: z.string(),
    sender_avatar: z.string().optional(),
    content: z.string(),
    image_url: z.string().optional().nullable(),
    audio_url: z.string().optional().nullable(),
    reply_to_id: z.string().optional().nullable(),
    is_system: z.boolean().default(false),
    call_metadata: z.object({
        status: z.enum(['missed', 'accepted', 'declined', 'finished']),
        type: z.enum(['audio', 'video']),
        duration: z.number(),
        callerId: z.string(),
        callerName: z.string(),
    }).optional().nullable(),
    created_at: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
