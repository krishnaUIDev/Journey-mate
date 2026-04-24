"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Snackbar, Alert } from "@mui/material";
import dayjs from "dayjs";

export interface Message {
    id: string;
    journey_id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string;
    content: string;
    created_at: string;
    reply_to_id?: string | null;
}

export interface JourneyRequest {
    id: string;
    journey_id: string;
    requester_id: string;
    requester_name: string;
    requester_avatar: string;
    status: 'pending' | 'accepted' | 'rejected' | 'none';
    created_at: string;
}

export interface NotificationItem {
    id: string;
    type: 'request' | 'status' | 'message';
    title: string;
    message: string;
    journeyId: string;
    read: boolean;
    created_at: string;
}

interface MessagesContextType {
    messages: Message[];
    loading: boolean;
    sendMessage: (journeyId: string, content: string, replyToId?: string | null) => Promise<void>;
    subscribeToJourney: (journeyId: string) => () => void;
    // New Request Flow
    sendRequest: (journeyId: string) => Promise<void>;
    getRequests: (journeyId: string) => Promise<JourneyRequest[]>;
    updateRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
    checkRequestStatus: (journeyId: string) => Promise<'pending' | 'accepted' | 'rejected' | 'none'>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    showNotification: (message: string, severity?: 'success' | 'error' | 'info') => void;
    myRequests: Record<string, 'pending' | 'accepted' | 'rejected' | 'none'>;
    notifications: NotificationItem[];
    markAsRead: (id: string) => void;
    unreadCount: number;
    activeJourneyId: string | null;
    setActiveJourneyId: (id: string | null) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [myRequests, setMyRequests] = useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'none'>>({});
    const [ownedJourneys, setOwnedJourneys] = useState<{ id: string; origin: string; destination: string }[]>([]);
    const [participatingJourneys, setParticipatingJourneys] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
    const activeJourneyIdRef = useRef<string | null>(null);
    const { user } = useUser();

    // Keep ref in sync
    useEffect(() => {
        activeJourneyIdRef.current = activeJourneyId;
    }, [activeJourneyId]);

    // Notification State
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info'
    });

    // Fetch all context data for global notifications
    useEffect(() => {
        if (user && supabase) {
            const fetchContextData = async () => {
                try {
                    // 1. My outgoing requests
                    const { data: reqData } = await (supabase as any)
                        .from('journey_requests')
                        .select('journey_id, status')
                        .eq('requester_id', user.id);

                    if (reqData) {
                        const requestMap = reqData.reduce((acc: any, req: any) => {
                            acc[req.journey_id] = req.status;
                            return acc;
                        }, {});
                        setMyRequests(requestMap);

                        // Also track which journeys I'm an accepted participant in
                        setParticipatingJourneys(reqData.filter((r: any) => r.status === 'accepted').map((r: any) => r.journey_id));
                    }

                    // 2. My owned journeys
                    const { data: ownData } = await (supabase as any)
                        .from('journeys')
                        .select('id, origin, destination')
                        .eq('user_id', user.id);

                    if (ownData) {
                        setOwnedJourneys(ownData);
                    }
                } catch (err) {
                    console.error("[MessagesContext] Error fetching context data:", err);
                }
            };

            fetchContextData();

            // Realtime subscriptions for Dashboard Notifications
            const globalChannel = (supabase as any)
                .channel(`global_notifications_${user.id}`)
                // Listen for updates on MY requests (Accepted/Rejected)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'journey_requests',
                        filter: `requester_id=eq.${user.id}`,
                    },
                    async (payload: any) => {
                        const oldStatus = myRequests[payload.new.journey_id];
                        const newStatus = payload.new.status;

                        if (oldStatus !== newStatus && newStatus !== 'pending') {
                            setMyRequests(prev => ({ ...prev, [payload.new.journey_id]: newStatus }));

                            // Get journey details for the notification
                            const { data: jData } = await (supabase as any)
                                .from('journeys')
                                .select('origin, destination')
                                .eq('id', payload.new.journey_id)
                                .single();

                            const title = newStatus === 'accepted' ? 'Request Accepted' : 'Request Declined';
                            const msg = newStatus === 'accepted'
                                ? `You're joining the trip to ${jData?.destination}.`
                                : `Your request for ${jData?.destination} was declined.`;

                            showNotification(msg, newStatus === 'accepted' ? 'success' : 'info');

                            // Add to notification history
                            const newNotif: NotificationItem = {
                                id: payload.new.id || Math.random().toString(36).substr(2, 9),
                                type: 'status',
                                title,
                                message: msg,
                                journeyId: payload.new.journey_id,
                                read: false,
                                created_at: new Date().toISOString()
                            };
                            setNotifications(prev => {
                                if (prev.some(n => n.id === payload.new.id)) return prev;
                                return [newNotif, ...prev];
                            });

                            if (newStatus === 'accepted') {
                                setParticipatingJourneys(prev => [...new Set([...prev, payload.new.journey_id])]);
                            }
                        }
                    }
                )
                // Listen for incoming requests on MY journeys
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'journey_requests',
                    },
                    (payload: any) => {
                        setOwnedJourneys(currentOwned => {
                            const journey = currentOwned.find(j => j.id === payload.new.journey_id);
                            if (journey) {
                                const msg = `Someone wants to join your trip to ${journey.destination}.`;
                                showNotification(`New Pairing Request! ${msg}`, 'info');

                                const newNotif: NotificationItem = {
                                    id: payload.new.id || Math.random().toString(36).substr(2, 9),
                                    type: 'request',
                                    title: 'Pairing Request',
                                    message: msg,
                                    journeyId: payload.new.journey_id,
                                    read: false,
                                    created_at: new Date().toISOString()
                                };
                                setNotifications(prev => {
                                    if (prev.some(n => n.id === payload.new.id)) return prev;
                                    return [newNotif, ...prev];
                                });
                            }
                            return currentOwned;
                        });
                    }
                )
                // Listen for messages in journeys I'm part of
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'journey_messages',
                    },
                    (payload: any) => {
                        if (payload.new.sender_id === user.id) return;

                        // Check if it belongs to an owned or participating journey
                        setOwnedJourneys(currentOwned => {
                            const isOwned = currentOwned.some(j => j.id === payload.new.journey_id);

                            setParticipatingJourneys(currentPart => {
                                const isPart = currentPart.includes(payload.new.journey_id);
                                if ((isOwned || isPart) && payload.new.journey_id !== activeJourneyIdRef.current) {
                                    const msg = `${payload.new.sender_name} posted in the journey chat.`;
                                    showNotification(`New Message: ${msg}`, 'info');

                                    const newNotif: NotificationItem = {
                                        id: payload.new.id || Math.random().toString(36).substr(2, 9),
                                        type: 'message',
                                        title: 'New Message',
                                        message: msg,
                                        journeyId: payload.new.journey_id,
                                        read: false,
                                        created_at: new Date().toISOString()
                                    };
                                    setNotifications(prev => {
                                        if (prev.some(n => n.id === payload.new.id)) return prev;
                                        return [newNotif, ...prev];
                                    });
                                }
                                return currentPart;
                            });

                            return currentOwned;
                        });
                    }
                )
                // Listen for changes to MY journeys to keep ownedJourneys synced
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'journeys',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload: any) => {
                        if (payload.eventType === 'INSERT') {
                            setOwnedJourneys(prev => [...prev, {
                                id: payload.new.id,
                                origin: payload.new.origin,
                                destination: payload.new.destination
                            }]);
                        } else if (payload.eventType === 'DELETE') {
                            setOwnedJourneys(prev => prev.filter(j => j.id !== payload.old.id));
                        } else if (payload.eventType === 'UPDATE') {
                            setOwnedJourneys(prev => prev.map(j => j.id === payload.new.id ? {
                                id: payload.new.id,
                                origin: payload.new.origin,
                                destination: payload.new.destination
                            } : j));
                        }
                    }
                )
                .subscribe();

            return () => {
                (supabase as any).removeChannel(globalChannel);
            };
        }
    }, [user]);

    const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

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

    const sendMessage = async (journeyId: string, content: string, replyToId: string | null = null) => {
        if (!user) {
            const errorMsg = "You must be logged in to participate in the discussion.";
            showNotification(errorMsg, 'error');
            throw new Error(errorMsg);
        }
        if (!supabase) {
            const errorMsg = "Database connection error. Please try again later.";
            showNotification(errorMsg, 'error');
            throw new Error(errorMsg);
        }

        try {
            // Check if journey is past
            const { data: journeyData } = await (supabase as any)
                .from('journeys')
                .select('user_id, date')
                .eq('id', journeyId)
                .single();

            const isPast = journeyData?.date && dayjs(journeyData.date).isBefore(dayjs(), 'day');
            if (isPast) {
                showNotification("Discussion is archived for past trips.", 'info');
                return;
            }

            const isOwner = journeyData?.user_id === user.id;
            if (!isOwner) {
                const status = await checkRequestStatus(journeyId);
                if (status !== 'accepted') {
                    showNotification("You must be an accepted traveler to participate.", 'error');
                    return;
                }
            }

            const { error } = await (supabase as any)
                .from('journey_messages')
                .insert({
                    journey_id: journeyId,
                    sender_id: user.id,
                    sender_name: user.fullName || user.username || 'Anonymous',
                    sender_avatar: user.imageUrl,
                    content,
                    reply_to_id: replyToId
                });

            if (error) throw error;
        } catch (err: any) {
            console.error("[MessagesContext] Error sending message:", err);
            showNotification(`Failed to send message: ${err?.message || 'Unknown error'}`, 'error');
            throw err;
        }
    };

    const editMessage = async (messageId: string, content: string) => {
        if (!supabase) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_messages')
                .update({ content })
                .eq('id', messageId);
            if (error) throw error;
        } catch (err: any) {
            console.error("[MessagesContext] Error editing message:", err);
            showNotification(`Failed to edit message: ${err.message}`, 'error');
            throw err;
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!supabase) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting message:", err);
            showNotification(`Failed to delete message: ${err.message}`, 'error');
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
            showNotification("Your request has been sent! We'll notify you once accepted.", 'success');
        } catch (err: any) {
            console.error("[MessagesContext] Error sending request:", err);
            showNotification(`Failed to send request: ${err.message}`, 'error');
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
            showNotification(`Traveler request ${status === 'accepted' ? 'approved' : 'declined'}.`, status === 'accepted' ? 'success' : 'info');
        } catch (err: any) {
            console.error("[MessagesContext] Error updating request status:", err);
            showNotification(`Failed to update request: ${err.message}`, 'error');
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
                    event: '*',
                    schema: 'public',
                    table: 'journey_messages',
                    // Temporarily remove filter for debugging
                },
                (payload: any) => {

                    if (payload.eventType === 'INSERT') {
                        if (payload.new.journey_id === journeyId) {
                            setMessages((prev) => [...prev, payload.new as Message]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        if (payload.new.journey_id === journeyId) {
                            console.log("[MessagesContext] Updating message:", payload.new.id, payload.new.content);
                            setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setMessages((prev) => {
                            if (prev.some(m => m.id === payload.old.id)) {
                                return prev.filter(m => m.id !== payload.old.id);
                            }
                            return prev;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            (supabase as any).removeChannel(channel);
        };
    }, [fetchMessages]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MessagesContext.Provider value={{
            messages,
            loading,
            sendMessage,
            subscribeToJourney,
            sendRequest,
            getRequests,
            updateRequestStatus,
            checkRequestStatus,
            editMessage,
            deleteMessage,
            showNotification,
            myRequests,
            notifications,
            markAsRead,
            unreadCount,
            activeJourneyId,
            setActiveJourneyId
        }}>
            {children}

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: 4 }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: '1.5rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        px: 3,
                        py: 1.5,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        bgcolor: notification.severity === 'success' ? 'forest' : notification.severity === 'error' ? '#ef4444' : 'navy',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '& .MuiAlert-icon': {
                            fontSize: '1.25rem',
                            mr: 2
                        }
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
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
