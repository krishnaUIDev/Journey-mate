"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image_url: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    location_label?: string;
    location_coords?: { lat: number; lng: number };
    category: string;
    created_at: string;
}

export async function getBlogPosts() {
    if (!supabase) throw new Error("Supabase not initialized");

    try {
        const { data, error } = await (supabase as any)
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    } catch (error) {
        console.error("Fetch Blog Posts Error:", error);
        return [];
    }
}

export async function getPostBySlug(slug: string) {
    if (!supabase) throw new Error("Supabase not initialized");

    try {
        const { data, error } = await (supabase as any)
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data as BlogPost;
    } catch (error) {
        console.error("Fetch Blog Post Error:", error);
        return null;
    }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'slug'>) {
    if (!supabase) throw new Error("Supabase not initialized");

    // Generate slug from title
    const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    try {
        const { data, error } = await (supabase as any)
            .from('blog_posts')
            .insert([{ ...post, slug }])
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/blog');
        return data as BlogPost;
    } catch (error: any) {
        console.error("Create Blog Post Error:", error);
        throw new Error(error.message || "Failed to create blog post");
    }
}
