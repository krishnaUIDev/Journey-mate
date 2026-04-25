"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useMessages } from "./MessagesContext";

export interface JourneyPost {
    id: string;
    userId?: string;
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
    groupName?: string;
    groupAvatar?: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

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
    tags: string[] | null;
    group_name: string | null;
    group_avatar: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
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
                userId: item.user_id ?? undefined,
                from: item.origin,
                to: item.destination,
                date: item.date,
                flightNumber: item.flight_number ?? undefined,
                contactInfo: item.contact_info ?? undefined,
                description: item.description || "",
                tags: item.tags || [],
                groupName: item.group_name ?? undefined,
                groupAvatar: item.group_avatar ?? undefined,
                status: item.status || 'upcoming',
                user: {
                    name: item.user_name,
                    avatar: item.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
                    rating: item.user_rating || 0,
                    verified: item.user_verified ?? false
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
                    const newItem: JourneyPost = {
                        id: newRecord.id,
                        userId: newRecord.user_id,
                        from: newRecord.origin,
                        to: newRecord.destination,
                        date: newRecord.date,
                        flightNumber: newRecord.flight_number,
                        contactInfo: newRecord.contact_info,
                        description: newRecord.description || "",
                        tags: newRecord.tags || [],
                        groupName: newRecord.group_name,
                        groupAvatar: newRecord.group_avatar,
                        status: newRecord.status || 'upcoming',
                        user: {
                            name: newRecord.user_name,
                            avatar: newRecord.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newRecord.id}`,
                            rating: newRecord.user_rating || 0,
                            verified: newRecord.user_verified ?? false
                        }
                    };
                    setJourneys(prev => {
                        if (prev.some(j => j.id === newItem.id)) return prev;
                        return [newItem, ...prev];
                    });
                } else if (eventType === 'UPDATE') {
                    setJourneys(prev => prev.map(j => (j.id === newRecord.id ? {
                        ...j,
                        from: newRecord.origin,
                        to: newRecord.destination,
                        date: newRecord.date,
                        flightNumber: newRecord.flight_number,
                        contactInfo: newRecord.contact_info,
                        description: newRecord.description || "",
                        tags: newRecord.tags || [],
                        groupName: newRecord.group_name,
                        groupAvatar: newRecord.group_avatar,
                        status: newRecord.status || j.status,
                        user: {
                            ...j.user,
                            name: newRecord.user_name,
                            avatar: newRecord.user_avatar || j.user.avatar,
                            rating: newRecord.user_rating || 0,
                            verified: newRecord.user_verified ?? false
                        }
                    } : j)));
                } else if (eventType === 'DELETE') {
                    setJourneys(prev => prev.filter(j => j.id !== oldRecord.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addJourney = async (newJourney: Omit<JourneyPost, "id">) => {
        if (!supabase) {
            console.error("Supabase client is null. Cannot add journey.");
            showNotification("Database connection error: Missing credentials.", 'error');
            return;
        }

        try {
            const { data, error: supabaseError } = await (supabase as any)
                .from('journeys')
                .insert([{
                    user_id: newJourney.userId,
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
                    tags: newJourney.tags,
                    status: newJourney.status || 'upcoming'
                }])
                .select()
                .single();

            if (supabaseError) throw supabaseError;

            if (data) {
                const row = data as JourneyRow;
                const addedJourney: JourneyPost = {
                    id: row.id,
                    userId: row.user_id ?? undefined,
                    from: row.origin,
                    to: row.destination,
                    date: row.date,
                    flightNumber: row.flight_number ?? undefined,
                    contactInfo: row.contact_info ?? undefined,
                    description: row.description || "",
                    tags: row.tags || [],
                    status: row.status || 'upcoming',
                    user: {
                        name: row.user_name,
                        avatar: row.user_avatar || "",
                        rating: row.user_rating || 5.0,
                        verified: row.user_verified ?? true
                    }
                };
                setJourneys(prev => [addedJourney, ...prev]);
                showNotification("Journey published successfully!", 'success');
            }
        } catch (err: any) {
            console.error("Error adding journey:", err);
            showNotification(`Failed to post journey: ${err.message}`, 'error');
        }
    };

    const deleteJourney = async (id: string) => {
        if (!supabase) return;
        try {
            const { error: supabaseError } = await (supabase as any)
                .from('journeys')
                .delete()
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            setJourneys(prev => prev.filter(j => j.id !== id));
            showNotification("Journey deleted successfully.", 'info');
        } catch (err: any) {
            console.error("Error deleting journey:", err);
            showNotification(`Failed to delete journey: ${err.message}`, 'error');
        }
    };

    const updateJourney = async (id: string, updates: Partial<Omit<JourneyPost, "id">>) => {
        if (!supabase) return;
        try {
            const mappedUpdates: any = {};
            if (updates.from) mappedUpdates.origin = updates.from;
            if (updates.to) mappedUpdates.destination = updates.to;
            if (updates.date) mappedUpdates.date = updates.date;
            if (updates.flightNumber) mappedUpdates.flight_number = updates.flightNumber;
            if (updates.contactInfo) mappedUpdates.contact_info = updates.contactInfo;
            if (updates.description) mappedUpdates.description = updates.description;
            if (updates.tags) mappedUpdates.tags = updates.tags;
            if (updates.groupName) mappedUpdates.group_name = updates.groupName;
            if (updates.groupAvatar) mappedUpdates.group_avatar = updates.groupAvatar;
            if (updates.status) mappedUpdates.status = updates.status;

            const { error: supabaseError } = await (supabase as any)
                .from('journeys')
                .update(mappedUpdates)
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            setJourneys(prev => prev.map(j => (j.id === id ? { ...j, ...updates } : j)));
            showNotification("Journey updated successfully!", 'success');
        } catch (err: any) {
            console.error("Error updating journey:", err);
            showNotification(`Failed to update journey: ${err.message}`, 'error');
        }
    };

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
