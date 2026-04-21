"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface JourneyPost {
    id: string;
    from: string;
    to: string;
    date: string;
    flightNumber?: string;
    contactInfo?: string;
    user: {
        name: string;
        avatar: string;
        rating: number;
        verified: boolean;
    };
    description: string;
    tags: string[];
}

interface JourneyRow {
    id: string;
    origin: string;
    destination: string;
    date: string;
    flight_number: string | null;
    contact_info: string | null;
    description: string | null;
    user_name: string;
    user_avatar: string | null;
    user_rating: number | null;
    user_verified: boolean | null;
    tags: string[] | null;
    created_at: string;
}

interface JourneysContextType {
    journeys: JourneyPost[];
    loading: boolean;
    error: string | null;
    addJourney: (journey: Omit<JourneyPost, "id">) => Promise<void>;
}

const JourneysContext = createContext<JourneysContextType | undefined>(undefined);

export function JourneysProvider({ children }: { children: ReactNode }) {
    const [journeys, setJourneys] = useState<JourneyPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJourneys = async () => {
        if (!supabase) {
            console.error("Supabase client is null. Environment variables might be missing.");
            setError("Database connection error: Missing credentials.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error: supabaseError } = await (supabase as any)
                .from('journeys')
                .select('*')
                .order('created_at', { ascending: false });

            if (supabaseError) throw supabaseError;

            const mappedJourneys: JourneyPost[] = ((data as JourneyRow[]) || []).map(item => ({
                id: item.id,
                from: item.origin,
                to: item.destination,
                date: item.date,
                flightNumber: item.flight_number ?? undefined,
                contactInfo: item.contact_info ?? undefined,
                description: item.description || "",
                tags: item.tags || [],
                user: {
                    name: item.user_name,
                    avatar: item.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
                    rating: item.user_rating || 5.0,
                    verified: item.user_verified ?? true
                }
            }));

            setJourneys(mappedJourneys);
        } catch (err: any) {
            console.error("Error fetching journeys:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJourneys();
    }, []);

    const addJourney = async (newJourney: Omit<JourneyPost, "id">) => {
        if (!supabase) {
            console.error("Supabase client is null. Cannot add journey.");
            alert("Database connection error: Missing credentials.");
            return;
        }

        try {
            const { data, error: supabaseError } = await (supabase as any)
                .from('journeys')
                .insert([{
                    origin: newJourney.from,
                    destination: newJourney.to,
                    date: newJourney.date,
                    flight_number: newJourney.flightNumber,
                    contact_info: newJourney.contactInfo,
                    description: newJourney.description,
                    user_name: newJourney.user.name,
                    user_avatar: newJourney.user.avatar,
                    user_rating: newJourney.user.rating,
                    user_verified: newJourney.user.verified,
                    tags: newJourney.tags
                }])
                .select()
                .single();

            if (supabaseError) throw supabaseError;

            if (data) {
                const row = data as JourneyRow;
                const addedJourney: JourneyPost = {
                    id: row.id,
                    from: row.origin,
                    to: row.destination,
                    date: row.date,
                    flightNumber: row.flight_number ?? undefined,
                    contactInfo: row.contact_info ?? undefined,
                    description: row.description || "",
                    tags: row.tags || [],
                    user: {
                        name: row.user_name,
                        avatar: row.user_avatar || "",
                        rating: row.user_rating || 5.0,
                        verified: row.user_verified ?? true
                    }
                };
                setJourneys(prev => [addedJourney, ...prev]);
            }
        } catch (err: any) {
            console.error("Error adding journey:", err);
            alert(`Failed to post journey: ${err.message}`);
        }
    };

    return (
        <JourneysContext.Provider value={{ journeys, loading, error, addJourney }}>
            {children}
        </JourneysContext.Provider>
    );
}

export function useJourneys() {
    const context = useContext(JourneysContext);
    if (context === undefined) {
        throw new Error("useJourneys must be used within a JourneysProvider");
    }
    return context;
}
