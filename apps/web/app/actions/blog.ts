"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { BlogPost } from "@journey-mate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getBlogPosts() {
    try {
        const response = await fetch(`${API_URL}/blogs`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) throw new Error("Failed to fetch blog posts from API");
        return await response.json() as BlogPost[];
    } catch (error) {
        console.error("Fetch Blog Posts Error:", error);
        return [];
    }
}

export async function getPostBySlug(slug: string) {
    try {
        const response = await fetch(`${API_URL}/blogs/${slug}`, {
            next: { revalidate: 60 }
        });

        if (!response.ok) return null;
        return await response.json() as BlogPost;
    } catch (error) {
        console.error("Fetch Blog Post Error:", error);
        return null;
    }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'slug'>) {
    const { getToken } = await auth();
    const token = await getToken();

    try {
        const response = await fetch(`${API_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to create blog post via API");
        }

        const data = await response.json();
        revalidatePath('/blog');
        return data as BlogPost;
    } catch (error: any) {
        console.error("Create Blog Post Error:", error);
        throw new Error(error.message || "Failed to create blog post");
    }
}
