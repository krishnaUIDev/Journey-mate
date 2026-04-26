import { z } from 'zod';

export const GuestbookSchema = z.object({
    id: z.string().optional(),
    journey_id: z.string().uuid("Invalid journey ID"),
    author_id: z.string(),
    author_name: z.string(),
    author_avatar: z.string().optional().nullable(),
    content: z.string().min(1, "Message cannot be empty"),
    emotion: z.string().optional().nullable(),
    created_at: z.string().optional()
});

export type GuestbookEntry = z.infer<typeof GuestbookSchema>;
