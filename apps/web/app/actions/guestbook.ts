"use server";

import { supabase } from "../../lib/supabase";

export async function submitGuestbookEntry(entry: {
    journey_id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    content: string;
    emotion?: string;
}) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_guestbook')
            .insert([entry])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("Submit Guestbook Error:", error);
        throw new Error(error.message || "Failed to submit guestbook entry.");
    }
}

export async function getJourneyGuestbook(journeyId: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_guestbook')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error("Fetch Guestbook Error:", error);
        return [];
    }
}
