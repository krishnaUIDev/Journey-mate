"use server";

import { supabase } from "../../lib/supabase";

export async function addSouvenir(souvenir: {
    journey_id: string;
    user_id: string;
    type: 'photo' | 'note';
    content: string;
    caption?: string;
}) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_souvenirs')
            .insert([souvenir])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("Add Souvenir Error:", error);
        throw new Error(error.message || "Failed to add souvenir.");
    }
}

export async function getJourneySouvenirs(journeyId: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { data, error } = await (supabase as any)
            .from('journey_souvenirs')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error("Fetch Souvenirs Error:", error);
        return [];
    }
}

export async function deleteSouvenir(id: string) {
    if (!supabase) throw new Error("Supabase is not initialized.");

    try {
        const { error } = await (supabase as any)
            .from('journey_souvenirs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Delete Souvenir Error:", error);
        throw new Error("Failed to delete souvenir.");
    }
}
