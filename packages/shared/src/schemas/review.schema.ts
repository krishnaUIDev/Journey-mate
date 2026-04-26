import { z } from 'zod';

export const JourneyReviewSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    reviewer_id: z.string(),
    reviewee_id: z.string(),
    rating: z.number(),
    comment: z.string().optional(),
    created_at: z.string().optional(),
});

export type JourneyReview = z.infer<typeof JourneyReviewSchema>;
