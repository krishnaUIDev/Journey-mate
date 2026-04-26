"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useMessages } from "./MessagesContext";
import { useAuth } from "@clerk/nextjs";
import { Journey } from "@journey-mate/shared";

export type JourneyPost = Journey & { id: string };

interface JourneyRow {
    id: string;
    user_id: string | null;
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
    user_verification_tier: 'bronze' | 'silver' | 'gold' | null;
    tags: string[] | null;
    group_name: string | null;
    group_avatar: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    airline_name: string | null;
    airline_iata: string | null;
    boarding_pass_url: string | null;
    layovers: string[] | null;
    route_data: Record<string, [number, number]> | null;
    luggage_capacity: string | null;
    created_at: string;
}

interface JourneysContextType {
    journeys: JourneyPost[];
    loading: boolean;
    error: string | null;
    addJourney: (journey: Omit<JourneyPost, "id">) => Promise<void>;
    deleteJourney: (id: string) => Promise<void>;
    updateJourney: (id: string, updates: Partial<Omit<JourneyPost, "id">>) => Promise<void>;
}

const JourneysContext = createContext<JourneysContextType | undefined>(undefined);

export function JourneysProvider({ children }: { children: ReactNode }) {
    const [journeys, setJourneys] = useState<JourneyPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useMessages();

    const fetchJourneys = useCallback(async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/journeys`);

            if (!response.ok) {
                throw new Error('Failed to fetch journeys from API');
            }

            const data = await response.json();
            setJourneys(data || []);
        } catch (err: any) {
            console.error("Error fetching journeys via API:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJourneys();

        if (!supabase) return;

        const channel = (supabase as any)
            .channel('public:journeys')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'journeys'
            }, (payload: any) => {
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === 'INSERT') {
                    setJourneys(prev => {
                        if (prev.some(j => j.id === newRecord.id)) return prev;
                        return [newRecord, ...prev];
                    });
                } else if (eventType === 'UPDATE') {
                    setJourneys(prev => prev.map(j => (j.id === newRecord.id ? newRecord : j)));
                } else if (eventType === 'DELETE') {
                    setJourneys(prev => prev.filter(j => j.id !== oldRecord.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchJourneys]);

    const { getToken } = useAuth();

    const addJourney = useCallback(async (newJourney: Omit<JourneyPost, "id">) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token is missing. Please sign in again.');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/journeys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newJourney)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to post journey via API');
            }

            const data = await response.json();

            if (data) {
                setJourneys(prev => [data, ...prev]);
                showNotification("Journey published successfully via API!", 'success');
            }
        } catch (err: any) {
            console.error("Error adding journey via API:", err);
            showNotification(`Failed to post journey: ${err.message}`, 'error');
        }
    }, [getToken, showNotification]);

    const deleteJourney = useCallback(async (id: string) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token is missing.');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/journeys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to delete journey via API');
            }

            setJourneys(prev => prev.filter(j => j.id !== id));
            showNotification("Journey deleted successfully via API.", 'info');
        } catch (err: any) {
            console.error("Error deleting journey via API:", err);
            showNotification(`Failed to delete journey: ${err.message}`, 'error');
        }
    }, [getToken, showNotification]);

    const updateJourney = useCallback(async (id: string, updates: Partial<Omit<JourneyPost, "id">>) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token is missing.');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/journeys/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update journey via API');
            }

            const updatedRecord = await response.json();
            setJourneys(prev => prev.map(j => (j.id === id ? updatedRecord : j)));
            showNotification("Journey updated successfully via API!", 'success');
        } catch (err: any) {
            console.error("Error updating journey via API:", err);
            showNotification(`Failed to update journey: ${err.message}`, 'error');
        }
    }, [getToken, showNotification]);

    return (
        <JourneysContext.Provider value={{ journeys, loading, error, addJourney, deleteJourney, updateJourney }}>
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
