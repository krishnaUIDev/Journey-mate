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

export interface JourneyRequest {
    id: string;
    journey_id: string;
    requester_id: string;
    requester_name: string;
    requester_avatar: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

interface MessagesContextType {
    messages: Message[];
    loading: boolean;
    sendMessage: (journeyId: string, content: string) => Promise<void>;
    subscribeToJourney: (journeyId: string) => () => void;
    // New Request Flow
    sendRequest: (journeyId: string) => Promise<void>;
    getRequests: (journeyId: string) => Promise<JourneyRequest[]>;
    updateRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
    checkRequestStatus: (journeyId: string) => Promise<'pending' | 'accepted' | 'rejected' | 'none'>;
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
        if (!user) {
            const errorMsg = "You must be logged in to participate in the discussion.";
            alert(errorMsg);
            throw new Error(errorMsg);
        }
        if (!supabase) {
            const errorMsg = "Database connection error. Please try again later.";
            throw new Error(errorMsg);
        }

        try {
            const { error } = await (supabase as any)
                .from('journey_messages')
                .insert([{
                    journey_id: journeyId,
                    sender_id: user.id,
                    sender_name: user.fullName || user.username || "Anonymous",
                    sender_avatar: user.imageUrl,
                    content
                }]);

            if (error) throw error;
        } catch (err: any) {
            console.error("[MessagesContext] Error sending message:", err);
            alert(`Failed to send message: ${err?.message || 'Unknown error'}`);
            throw err;
        }
    };

    const sendRequest = async (journeyId: string) => {
        if (!user || !supabase) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_requests')
                .insert([{
                    journey_id: journeyId,
                    requester_id: user.id,
                    requester_name: user.fullName || user.username || "Anonymous",
                    requester_avatar: user.imageUrl,
                    status: 'pending'
                }]);
            if (error) throw error;
            alert("Request sent successfully!");
        } catch (err: any) {
            console.error("[MessagesContext] Error sending request:", err);
            alert(`Failed to send request: ${err.message}`);
        }
    };

    const getRequests = async (journeyId: string): Promise<JourneyRequest[]> => {
        if (!supabase) return [];
        try {
            const { data, error } = await (supabase as any)
                .from('journey_requests')
                .select('*')
                .eq('journey_id', journeyId);
            if (error) throw error;
            return data as JourneyRequest[];
        } catch (err) {
            console.error("[MessagesContext] Error fetching requests:", err);
            return [];
        }
    };

    const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
        if (!supabase) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_requests')
                .update({ status })
                .eq('id', requestId);
            if (error) throw error;
        } catch (err) {
            console.error("[MessagesContext] Error updating request status:", err);
        }
    };

    const checkRequestStatus = async (journeyId: string): Promise<'pending' | 'accepted' | 'rejected' | 'none'> => {
        if (!user || !supabase) return 'none';
        try {
            const { data, error } = await (supabase as any)
                .from('journey_requests')
                .select('status')
                .eq('journey_id', journeyId)
                .eq('requester_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
            return data?.status || 'none';
        } catch (err) {
            console.error("[MessagesContext] Error checking request status:", err);
            return 'none';
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
        <MessagesContext.Provider value={{
            messages,
            loading,
            sendMessage,
            subscribeToJourney,
            sendRequest,
            getRequests,
            updateRequestStatus,
            checkRequestStatus
        }}>
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
