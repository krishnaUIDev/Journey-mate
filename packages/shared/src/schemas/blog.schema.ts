import { z } from 'zod';

export const BlogSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(20, "Content is too short"),
    image_url: z.string().url("Invalid image URL"),
    author_id: z.string(),
    author_name: z.string(),
    author_avatar: z.string().optional().nullable(),
    location_label: z.string().optional().nullable(),
    location_coords: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional().nullable(),
    category: z.string().default('Travel'),
    created_at: z.string().optional()
});

export type BlogPost = z.infer<typeof BlogSchema>;
