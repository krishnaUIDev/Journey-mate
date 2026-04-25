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
    image_url?: string | null;
    audio_url?: string | null;
    created_at: string;
    reply_to_id?: string | null;
    is_system?: boolean;
    call_metadata?: {
        status: "missed" | "accepted" | "declined" | "finished";
        type: "audio" | "video";
        duration: number;
        callerId: string;
        callerName: string;
    } | null;
}

export interface JourneyRequest {
    id: string;
    journey_id: string;
    requester_id: string;
    requester_name: string;
    requester_avatar: string;
    status: 'pending' | 'accepted' | 'rejected' | 'none';
    message?: string;
    requester_rating?: number;
    requester_verified?: boolean;
    requester_audio_url?: string;
    boarding_pass_url?: string;
    mutual_companions?: string[];
    compatibility_score?: number;
    compatibility_reason?: string;
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
    sendMessage: (journeyId: string, content: string, replyToId?: string | null, imageUrl?: string | null, audioUrl?: string | null) => Promise<void>;
    uploadChatImage: (file: File) => Promise<string | null>;
    uploadChatAudio: (file: File | Blob) => Promise<string | null>;
    subscribeToJourney: (journeyId: string) => () => void;
    // New Request Flow
    sendRequest: (journeyId: string, message?: string, rating?: number, isVerified?: boolean, audioUrl?: string, boardingPassUrl?: string) => Promise<void>;
    getRequests: (journeyId: string) => Promise<JourneyRequest[]>;
    updateRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
    leaveJourney: (journeyId: string) => Promise<void>;
    getMutualCompanions: (userId1: string, userId2: string) => Promise<string[]>;
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
    isChatOpen: boolean;
    setIsChatOpen: (isOpen: boolean) => void;
    typingUsers: Record<string, { id: string; name: string; avatar: string }[]>;
    setTypingStatus: (journeyId: string, isTyping: boolean) => void;
    addExpense: (journeyId: string, amount: number, description: string) => Promise<void>;
    updateExpense: (journeyId: string, expenseId: string, amount: number, description: string) => Promise<void>;
    deleteExpense: (journeyId: string, expenseId: string, description: string) => Promise<void>;
    recordSettlement: (journeyId: string, amount: number, receiverId: string, receiverName: string) => Promise<void>;
    getExpenses: (journeyId: string) => Promise<any[]>;
    submitReview: (journeyId: string, revieweeId: string, rating: number, comment: string) => Promise<void>;
    getEmergencyContacts: (journeyId: string) => Promise<any[]>;
    saveEmergencyContact: (journeyId: string, name: string, phone: string, relation: string) => Promise<void>;
    deleteEmergencyContact: (journeyId: string) => Promise<void>;
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
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Record<string, { id: string; name: string; avatar: string }[]>>({});

    const activeJourneyIdRef = useRef<string | null>(null);
    const isChatOpenRef = useRef(false);
    const ownedJourneysRef = useRef<{ id: string; origin: string; destination: string }[]>([]);
    const participatingJourneysRef = useRef<string[]>([]);
    const userRef = useRef<any>(null);

    const channelsRef = useRef<Record<string, any>>({});
    const { user } = useUser();

    // Keep refs in sync
    useEffect(() => {
        activeJourneyIdRef.current = activeJourneyId;
    }, [activeJourneyId]);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    useEffect(() => {
        ownedJourneysRef.current = ownedJourneys;
    }, [ownedJourneys]);

    useEffect(() => {
        participatingJourneysRef.current = participatingJourneys;
    }, [participatingJourneys]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

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
                    async (payload: any) => {
                        const currentUser = userRef.current;
                        if (!currentUser || payload.new.sender_id === currentUser.id) return;

                        const journeyId = payload.new.journey_id;
                        const isOwned = ownedJourneysRef.current.some(j => j.id === journeyId);
                        const isPart = participatingJourneysRef.current.includes(journeyId);
                        const isActivePage = activeJourneyIdRef.current === journeyId;
                        const isChatVisible = isChatOpenRef.current && isActivePage;

                        console.log(`[MessagesContext] New message in ${journeyId}. isOwned: ${isOwned}, isPart: ${isPart}, isActivePage: ${isActivePage}, isChatVisible: ${isChatVisible}`);

                        if ((isOwned || isPart) && !isChatVisible) {
                            const msg = `${payload.new.sender_name} posted in the journey chat.`;
                            showNotification(`New Message: ${msg}`, 'info');

                            const newNotif: NotificationItem = {
                                id: payload.new.id || Math.random().toString(36).substr(2, 9),
                                type: 'message',
                                title: 'New Message',
                                message: msg,
                                journeyId: journeyId,
                                read: false,
                                created_at: new Date().toISOString()
                            };

                            setNotifications(prev => {
                                if (prev.some(n => n.id === payload.new.id)) return prev;
                                return [newNotif, ...prev];
                            });
                        }
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

    const uploadChatImage = async (file: File): Promise<string | null> => {
        if (!supabase || !user) return null;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error("[MessagesContext] Error uploading image:", err);
            showNotification("Failed to upload image.", "error");
            return null;
        }
    };

    const uploadChatAudio = async (file: File | Blob): Promise<string | null> => {
        if (!supabase || !user) return null;
        try {
            const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.webm`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error("[MessagesContext] Error uploading audio:", err);
            showNotification("Failed to upload audio.", "error");
            return null;
        }
    };

    const sendMessage = async (journeyId: string, content: string, replyToId: string | null = null, imageUrl: string | null = null, audioUrl: string | null = null) => {
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
                    reply_to_id: replyToId,
                    image_url: imageUrl,
                    audio_url: audioUrl
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

    const calculateCompatibility = (journeyDesc: string, requestMsg: string): { score: number; reason: string } => {
        const desc = (journeyDesc || '').toLowerCase();
        const msg = (requestMsg || '').toLowerCase();

        const matchRules = [
            { keywords: ['medical', 'nurse', 'doctor', 'rn', 'healthcare'], reason: 'Both mention medical or healthcare backgrounds' },
            { keywords: ['quiet', 'silent', 'relax', 'noise'], reason: 'Both prefer a peaceful and quiet travel environment' },
            { keywords: ['help', 'luggage', 'assistance', 'disabled'], reason: 'Alignment on helpfulness and assistance needs' },
            { keywords: ['hindi', 'punjabi', 'telugu', 'bilingual'], reason: 'Shared language proficiency for easier communication' },
            { keywords: ['business', 'professional', 'work', 'laptop'], reason: 'Both are traveling for professional or business purposes' },
            { keywords: ['family', 'kids', 'children', 'parent'], reason: 'Shared understanding of family travel dynamics' },
            { keywords: ['music', 'podcast', 'chat', 'social'], reason: 'Both enjoy social interaction and entertainment' }
        ];

        let matchedReason = 'General travel compatibility based on route';
        let score = 30 + Math.floor(Math.random() * 20); // Base score

        for (const rule of matchRules) {
            const hasDescMatch = rule.keywords.some(k => desc.includes(k));
            const hasMsgMatch = rule.keywords.some(k => msg.includes(k));

            if (hasDescMatch && hasMsgMatch) {
                score = Math.min(98, score + 40);
                matchedReason = rule.reason;
                break;
            } else if (hasMsgMatch) {
                score = Math.min(90, score + 15);
            }
        }

        return { score, reason: matchedReason };
    };

    const sendRequest = async (journeyId: string, message: string = '', rating: number = 5.0, isVerified: boolean = true, audioUrl: string = '', boardingPassUrl: string = '') => {
        if (!user || !supabase) return;
        try {
            // Fetch journey description for compatibility check
            const { data: journeyData } = await (supabase as any)
                .from('journeys')
                .select('description')
                .eq('id', journeyId)
                .single();

            const { score, reason } = calculateCompatibility(journeyData?.description || '', message);

            const { error } = await (supabase as any)
                .from('journey_requests')
                .insert([{
                    journey_id: journeyId,
                    requester_id: user.id,
                    requester_name: user.fullName || user.username || "Anonymous",
                    requester_avatar: user.imageUrl,
                    status: 'pending',
                    message: message || '',
                    requester_rating: rating || 5.0,
                    requester_verified: isVerified ?? true,
                    requester_audio_url: audioUrl || null,
                    boarding_pass_url: boardingPassUrl || null,
                    compatibility_score: score,
                    compatibility_reason: reason
                }]);
            if (error) throw error;
            showNotification("Your request has been sent! We'll notify you once accepted.", 'success');
        } catch (err: any) {
            console.error("[MessagesContext] Error sending request:", err);
            showNotification(`Failed to send request: ${err.message}`, 'error');
        }
    };

    const getMutualCompanions = async (userId1: string, userId2: string): Promise<string[]> => {
        if (!supabase) return [];
        try {
            // Find shared journeys where both users were accepted
            const { data: journeys1 } = await (supabase as any)
                .from('journey_requests')
                .select('journey_id')
                .eq('requester_id', userId1)
                .eq('status', 'accepted');

            const { data: journeys2 } = await (supabase as any)
                .from('journey_requests')
                .select('journey_id')
                .eq('requester_id', userId2)
                .eq('status', 'accepted');

            if (!journeys1 || !journeys2) return [];

            const ids1 = new Set(journeys1.map((j: any) => j.journey_id));
            const commonIds = (journeys2 as any[]).map(j => j.journey_id).filter(id => ids1.has(id));

            if (commonIds.length === 0) return [];

            // Get names of other travelers in those common journeys
            const { data: connections } = await (supabase as any)
                .from('journey_requests')
                .select('requester_name')
                .in('journey_id', commonIds)
                .neq('requester_id', userId1)
                .neq('requester_id', userId2)
                .eq('status', 'accepted')
                .limit(3);

            return connections ? connections.map((c: any) => c.requester_name) : [];
        } catch (err) {
            console.error("[MessagesContext] Error fetching mutual companions:", err);
            return [];
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
            // First fetch the request to get the name and current status
            const { data: request } = await (supabase as any)
                .from('journey_requests')
                .select('requester_name, journey_id, requester_id, status')
                .eq('id', requestId)
                .single();

            const { error } = await (supabase as any)
                .from('journey_requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            // If it was a removal (rejected from an accepted state), send a system message
            if (status === 'rejected' && request?.status === 'accepted') {
                const userName = request.requester_name || 'Someone';
                await (supabase as any)
                    .from('journey_messages')
                    .insert({
                        journey_id: request.journey_id,
                        sender_id: request.requester_id,
                        sender_name: userName,
                        sender_avatar: '',
                        content: `${userName} was removed from the group`,
                        is_system: true
                    });
            }

            showNotification(`Traveler request ${status === 'accepted' ? 'approved' : 'declined'}.`, status === 'accepted' ? 'success' : 'info');
        } catch (err: any) {
            console.error("[MessagesContext] Error updating request status:", err);
            showNotification(`Failed to update request: ${err.message}`, 'error');
        }
    };

    const leaveJourney = async (journeyId: string) => {
        if (!supabase || !user) return;
        try {
            // 1. Send system message first while still accepted
            const userName = user.fullName || user.username || 'Someone';
            await (supabase as any)
                .from('journey_messages')
                .insert({
                    journey_id: journeyId,
                    sender_id: user.id,
                    sender_name: userName,
                    sender_avatar: user.imageUrl,
                    content: `${userName} left the group`,
                    is_system: true
                });

            // 2. Update status to rejected (to revoke access)
            const { error } = await (supabase as any)
                .from('journey_requests')
                .update({ status: 'rejected' })
                .eq('journey_id', journeyId)
                .eq('requester_id', user.id);

            if (error) throw error;

            setParticipatingJourneys(prev => prev.filter(id => id !== journeyId));
            setMyRequests(prev => ({ ...prev, [journeyId]: 'rejected' }));

            showNotification("You have left the journey discussion.", 'info');
        } catch (err: any) {
            console.error("[MessagesContext] Error leaving journey:", err);
            showNotification(`Failed to leave journey: ${err.message}`, 'error');
        }
    };

    const setTypingStatus = (journeyId: string, isTyping: boolean) => {
        if (!user || !supabase) return;
        const channel = channelsRef.current[journeyId];
        if (!channel) return;

        if (isTyping) {
            channel.track({
                id: user.id,
                name: user.fullName || user.username || 'Anonymous',
                avatar: user.imageUrl,
                is_typing: true,
                online_at: new Date().toISOString(),
            });
        } else {
            channel.untrack();
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
            .channel(`journey_chat:${journeyId}`, {
                config: {
                    presence: {
                        key: user?.id || 'anonymous',
                    },
                },
            });

        channelsRef.current[journeyId] = channel;

        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'journey_messages',
                    filter: `journey_id=eq.${journeyId}`,
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setMessages((prev) => {
                            if (prev.some(m => m.id === payload.new.id)) return prev;
                            return [...prev, payload.new as Message];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
                    } else if (payload.eventType === 'DELETE') {
                        setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
                    }
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const typing: { id: string; name: string; avatar: string }[] = [];

                Object.values(newState).forEach((presences: any) => {
                    presences.forEach((presence: any) => {
                        if (presence.is_typing && presence.id !== user?.id) {
                            typing.push({
                                id: presence.id,
                                name: presence.name,
                                avatar: presence.avatar
                            });
                        }
                    });
                });

                setTypingUsers(prev => ({ ...prev, [journeyId]: typing }));
            })
            .subscribe();

        return () => {
            delete channelsRef.current[journeyId];
            (supabase as any).removeChannel(channel);
            setTypingUsers(prev => {
                const next = { ...prev };
                delete next[journeyId];
                return next;
            });
        };
    }, [fetchMessages, user?.id]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const addExpense = async (journeyId: string, amount: number, description: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_expenses')
                .insert([{
                    journey_id: journeyId,
                    payer_id: user.id,
                    payer_name: user.fullName || user.username || "Anonymous",
                    amount,
                    description,
                    currency: 'USD'
                }]);
            if (error) throw error;
            showNotification("Expense added and shared with the group!", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error adding expense:", err);
            showNotification("Failed to add expense.", "error");
        }
    };

    const getExpenses = async (journeyId: string) => {
        if (!supabase) return [];
        const { data } = await (supabase as any)
            .from('journey_expenses')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });
        return data || [];
    };

    const updateExpense = async (journeyId: string, expenseId: string, amount: number, description: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_expenses')
                .update({ amount, description })
                .eq('id', expenseId)
                .eq('payer_id', user.id);
            if (error) throw error;

            // Post a notification in chat
            await sendMessage(journeyId, `[EXPENSE UPDATED] ${description}: $${amount.toFixed(2)}`);
            showNotification("Expense updated.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error updating expense:", err);
            showNotification("Failed to update expense.", "error");
        }
    };

    const deleteExpense = async (journeyId: string, expenseId: string, description: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_expenses')
                .delete()
                .eq('id', expenseId)
                .eq('payer_id', user.id);
            if (error) throw error;

            // Post a notification in chat
            await sendMessage(journeyId, `[EXPENSE REMOVED] ${description}`);
            showNotification("Expense removed.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting expense:", err);
            showNotification("Failed to delete expense.", "error");
        }
    };

    const recordSettlement = async (journeyId: string, amount: number, receiverId: string, receiverName: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_expenses')
                .insert([{
                    journey_id: journeyId,
                    payer_id: user.id,
                    payer_name: user.firstName || "Traveler",
                    amount: amount,
                    description: `Settled balance with ${receiverName}`,
                    is_settlement: true,
                    receiver_id: receiverId
                }]);
            if (error) throw error;

            // Post notification in chat
            await sendMessage(journeyId, `[SETTLED] ${user.firstName} paid ${receiverName}: $${amount.toFixed(2)}`);
            showNotification(`Settlement recorded with ${receiverName}`, "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error recording settlement:", err);
            showNotification("Failed to record settlement.", "error");
        }
    };

    const submitReview = async (journeyId: string, revieweeId: string, rating: number, comment: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_reviews')
                .insert([{
                    journey_id: journeyId,
                    reviewer_id: user.id,
                    reviewee_id: revieweeId,
                    rating,
                    comment
                }]);
            if (error) throw error;
            showNotification("Thank you for your review!", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error submitting review:", err);
            showNotification("Failed to submit review.", "error");
        }
    };

    const getEmergencyContacts = async (journeyId: string) => {
        if (!supabase) return [];
        const { data } = await (supabase as any)
            .from('journey_emergency_contacts')
            .select('*')
            .eq('journey_id', journeyId);

        // Soft self-destruct: Filter out expired contacts
        return (data || []).filter((c: any) => dayjs().isBefore(dayjs(c.expires_at)));
    };

    const saveEmergencyContact = async (journeyId: string, name: string, phone: string, relation: string) => {
        if (!supabase || !user) return;
        try {
            const expiresAt = dayjs().add(7, 'day').toISOString();

            // Use upsert to enforce single-contact limit per participant
            const { error } = await (supabase as any)
                .from('journey_emergency_contacts')
                .upsert([
                    {
                        journey_id: journeyId,
                        user_id: user.id,
                        uploader_name: user.fullName || user.username || "A Participant",
                        contact_name: name,
                        contact_phone: phone,
                        relation,
                        expires_at: expiresAt
                    }
                ], { onConflict: 'journey_id,user_id' }); // Note: Requires UNIQUE constraint on (journey_id, user_id)

            if (error) throw error;
            showNotification("Emergency contact updated in the Security Vault.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error saving contact:", err);
            showNotification("Failed to save contact.", "error");
        }
    };

    const deleteEmergencyContact = async (journeyId: string) => {
        if (!supabase || !user) return;
        try {
            const { error } = await (supabase as any)
                .from('journey_emergency_contacts')
                .delete()
                .eq('journey_id', journeyId)
                .eq('user_id', user.id);

            if (error) throw error;
            showNotification("Your emergency contact has been removed.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting contact:", err);
            showNotification("Failed to delete contact.", "error");
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MessagesContext.Provider value={{
            messages,
            loading,
            sendMessage,
            uploadChatImage,
            subscribeToJourney,
            sendRequest,
            getRequests,
            updateRequestStatus,
            leaveJourney,
            getMutualCompanions,
            checkRequestStatus,
            editMessage,
            deleteMessage,
            showNotification,
            myRequests,
            notifications,
            markAsRead,
            unreadCount,
            activeJourneyId,
            setActiveJourneyId,
            isChatOpen,
            setIsChatOpen,
            typingUsers,
            setTypingStatus,
            uploadChatAudio,
            addExpense,
            updateExpense,
            deleteExpense,
            recordSettlement,
            getExpenses,
            submitReview,
            getEmergencyContacts,
            saveEmergencyContact,
            deleteEmergencyContact
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
