"use server";

import { supabase } from "../../lib/supabase";

export async function addItineraryItem(item: {
    journey_id: string;
    title: string;
    description?: string;
    type: 'meetup' | 'activity' | 'layover' | 'food' | 'transport';
    start_time?: string;
    location?: string;
    created_by: string;
}) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_itinerary')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("Add Itinerary Error:", error);
        throw new Error(error.message || "Failed to add itinerary item.");
    }
}

export async function getJourneyItinerary(journeyId: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_itinerary')
            .select('*')
            .eq('journey_id', journeyId)
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error("Fetch Itinerary Error:", error);
        return [];
    }
}

export async function deleteItineraryItem(id: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { error } = await (supabase as any)
            .from('journey_itinerary')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Delete Itinerary Error:", error);
        throw new Error("Failed to delete itinerary item.");
    }
}
