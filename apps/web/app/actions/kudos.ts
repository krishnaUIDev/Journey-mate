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

    try {
        const { error } = await (supabase as any)
            .from('user_reviews')
            .insert([review]);

        if (error) throw error;

        // Optionally update the reviewee's rating in user_profiles
        // This would require a more complex calculation in a real app,
        // but for now, we just log it and rely on the UI to aggregate.

        return { success: true };
    } catch (error: any) {
        console.error("Kudos Error:", error);
        throw new Error("Failed to submit kudos.");
    }
}
