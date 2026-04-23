"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/nextjs";

export interface Message {
    id: string;
    journey_id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string;
    content: string;
    created_at: string;
}

interface MessagesContextType {
    messages: Message[];
    loading: boolean;
    sendMessage: (journeyId: string, content: string) => Promise<void>;
    subscribeToJourney: (journeyId: string) => () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const fetchMessages = useCallback(async (journeyId: string) => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('journey_messages')
                .select('*')
                .eq('journey_id', journeyId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            console.log(`[MessagesContext] Fetched ${data?.length || 0} messages for journey ${journeyId}`);
            setMessages(data || []);
        } catch (err: any) {
            // PGRST204/PGRST205: Table not found in schema cache
            // 42P01: undefined_table
            if (err?.code === 'PGRST204' || err?.code === 'PGRST205' || err?.code === '42P01') {
                console.warn("[MessagesContext] Table 'journey_messages' not found. Run the SQL migration script from walkthrough.md.");
            } else {
                console.error("Error fetching messages:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const sendMessage = async (journeyId: string, content: string) => {
        if (!supabase || !user) {
            console.error("[MessagesContext] Cannot send message: client or user missing", { hasSupabase: !!supabase, hasUser: !!user });
            return;
        }

        try {
            const { error } = await (supabase as any)
                .from('journey_messages')
                .insert([{
                    journey_id: journeyId,
                    sender_id: user.id,
                    sender_name: user.fullName || user.username || "Traveler",
                    sender_avatar: user.imageUrl,
                    content
                }]);

            if (error) throw error;
        } catch (err: any) {
            console.error("[MessagesContext] Error sending message:", err);
            if (err?.code === 'PGRST204' || err?.code === 'PGRST205' || err?.code === '42P01') {
                console.warn("[MessagesContext] Table 'journey_messages' missing.");
                alert("The chat system requires a database update. Please ensure the SQL migration has been applied.");
            } else {
                alert(`Failed to send message: ${err?.message || 'Unknown error'}`);
            }
        }
    };

    const subscribeToJourney = useCallback((journeyId: string) => {
        if (!supabase) return () => { };

        // Initial fetch
        fetchMessages(journeyId);

        // Realtime subscription
        const channel = (supabase as any)
            .channel(`journey_messages:journey_id=eq.${journeyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'journey_messages',
                    filter: `journey_id=eq.${journeyId}`,
                },
                (payload: any) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            (supabase as any).removeChannel(channel);
        };
    }, [fetchMessages]);

    return (
        <MessagesContext.Provider value={{ messages, loading, sendMessage, subscribeToJourney }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error("useMessages must be used within a MessagesProvider");
    }
    return context;
}
