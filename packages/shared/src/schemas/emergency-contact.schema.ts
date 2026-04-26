import { z } from 'zod';

export const EmergencyContactSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    user_id: z.string(),
    uploader_name: z.string(),
    contact_name: z.string(),
    contact_phone: z.string(),
    relation: z.string().optional(),
    expires_at: z.string(),
    created_at: z.string().optional(),
});

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
