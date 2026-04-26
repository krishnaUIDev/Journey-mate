"use server";

import { supabase } from "../../lib/supabase";

export async function submitKudos(review: {
    reviewer_id: string;
    reviewee_id: string;
    journey_id: string;
    content: string;
    type: 'positive' | 'neutral' | 'negative';
}) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    // Security & Logic checks
    if (review.reviewer_id === review.reviewee_id) {
        throw new Error("You cannot give kudos to yourself.");
    }

    const { data: existing } = await (supabase as any)
        .from('user_reviews')
        .select('id')
        .eq('reviewer_id', review.reviewer_id)
        .eq('reviewee_id', review.reviewee_id)
        .limit(1);

    if (existing && existing.length > 0) {
        throw new Error("You have already given kudos to this user.");
    }

    try {
        const { error } = await (supabase as any)
            .from('user_reviews')
            .insert([review]);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Kudos Submit Error:", error);
        throw new Error(error.message || "Failed to submit kudos.");
    }
}

export async function getUserKudos(userId: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('user_reviews')
            .select('*')
            .eq('reviewee_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error("Kudos Fetch Error:", error);
        return [];
    }
}
