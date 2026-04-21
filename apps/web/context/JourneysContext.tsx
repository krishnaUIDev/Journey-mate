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

            const mappedJourneys: JourneyPost[] = (data || []).map(item => ({
                id: item.id,
                from: item.origin,
                to: item.destination,
                date: item.date,
                flightNumber: item.flight_number,
                contactInfo: item.contact_info,
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
                const addedJourney: JourneyPost = {
                    id: data.id,
                    from: data.origin,
                    to: data.destination,
                    date: data.date,
                    flightNumber: data.flight_number,
                    contactInfo: data.contact_info,
                    description: data.description || "",
                    tags: data.tags || [],
                    user: {
                        name: data.user_name,
                        avatar: data.user_avatar,
                        rating: data.user_rating,
                        verified: data.user_verified
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
