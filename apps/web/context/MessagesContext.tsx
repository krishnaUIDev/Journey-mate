"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";
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
    supabase: any;
    loading: boolean;
    sendMessage: (journeyId: string, content: string, replyToId?: string | null, imageUrl?: string | null, audioUrl?: string | null) => Promise<void>;
    uploadChatImage: (file: File) => Promise<string | null>;
    uploadChatAudio: (file: File | Blob) => Promise<string | null>;
    subscribeToJourney: (journeyId: string, options?: {
        onItineraryChange?: () => void;
        onSouvenirChange?: () => void;
        onRequestsChange?: () => void;
    }) => () => void;
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
    shareLocation: (journeyId: string, lat: number, lng: number) => Promise<void>;
    squadLocations: Record<string, { userId: string; userName: string; lat: number; lng: number; updatedAt: string }>;
    getSouvenirs: (journeyId: string) => Promise<any[]>;
    addSouvenir: (journeyId: string, imageUrl: string, caption: string) => Promise<any>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [squadLocations, setSquadLocations] = useState<Record<string, { userId: string; userName: string; lat: number; lng: number; updatedAt: string }>>({});
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
    const listenersRef = useRef<Record<string, {
        onItineraryChange: Set<() => void>;
        onSouvenirChange: Set<() => void>;
        onRequestsChange: Set<() => void>;
    }>>({});
    const subscriptionCountsRef = useRef<Record<string, number>>({});
    const { user } = useUser();
    const { getToken } = useAuth();

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
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                    const token = await getToken();

                    // 1. My outgoing requests (Simplified: we'll fetch all and filter or use a specific endpoint)
                    const reqRes = await fetch(`${apiUrl}/requests/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (reqRes.ok) {
                        const reqData = await reqRes.json();
                        const requestMap = reqData.reduce((acc: any, req: any) => {
                            acc[req.journey_id] = req.status;
                            return acc;
                        }, {});
                        setMyRequests(requestMap);
                        setParticipatingJourneys(reqData.filter((r: any) => r.status === 'accepted').map((r: any) => r.journey_id));
                    }

                    // 2. My owned journeys
                    const ownRes = await fetch(`${apiUrl}/journeys/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (ownRes.ok) {
                        const ownData = await ownRes.json();
                        setOwnedJourneys(ownData);
                    }
                } catch (err) {
                    console.error("[MessagesContext] Error fetching context data via API:", err);
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

                            // Get journey details for the notification via API
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                            const jRes = await fetch(`${apiUrl}/journeys/${payload.new.journey_id}`);
                            const jData = jRes.ok ? await jRes.json() : null;

                            const title = newStatus === 'accepted' ? 'Request Accepted' : 'Request Declined';
                            const msg = newStatus === 'accepted'
                                ? `You're joining the trip to ${jData?.destination || 'your destination'}.`
                                : `Your request for ${jData?.destination || 'the trip'} was declined.`;

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

    const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ open: true, message, severity });
    }, []);

    const handleCloseNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, open: false }));
    }, []);

    const fetchMessages = useCallback(async (journeyId: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/messages/journey/${journeyId}`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();

            console.log(`[MessagesContext] Fetched ${data?.length || 0} messages via API for journey ${journeyId}`);
            setMessages(data || []);
        } catch (err: any) {
            console.error("Error fetching messages via API:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadChatImage = useCallback(async (file: File): Promise<string | null> => {
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
    }, [user, showNotification]);

    const uploadChatAudio = useCallback(async (file: File | Blob): Promise<string | null> => {
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
    }, [user, showNotification]);

    const sendMessage = useCallback(async (journeyId: string, content: string, replyToId: string | null = null, imageUrl: string | null = null, audioUrl: string | null = null) => {
        if (!user) {
            const errorMsg = "You must be logged in to participate in the discussion.";
            showNotification(errorMsg, 'error');
            throw new Error(errorMsg);
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token is missing. Please sign in again.');
            }

            const optimisticId = `opt-${Math.random().toString(36).substr(2, 9)}`;
            const newMessage: Message = {
                id: optimisticId,
                journey_id: journeyId,
                sender_id: user.id,
                sender_name: user.fullName || user.username || 'Anonymous',
                sender_avatar: user.imageUrl,
                content,
                reply_to_id: replyToId,
                image_url: imageUrl,
                audio_url: audioUrl,
                created_at: new Date().toISOString()
            };

            // Optimistic update
            setMessages(prev => [...prev, newMessage]);

            const res = await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    sender_id: user.id,
                    sender_name: user.fullName || user.username || 'Anonymous',
                    sender_avatar: user.imageUrl,
                    content,
                    reply_to_id: replyToId,
                    image_url: imageUrl,
                    audio_url: audioUrl
                })
            });

            if (!res.ok) throw new Error('Failed to send message via API');
            const data = await res.json();

            // Replace optimistic message
            if (data) {
                setMessages(prev => prev.map(m => m.id === optimisticId ? data as Message : m));
            }

            console.log("[MessagesContext] Message sent via API and reconciled");
        } catch (err: any) {
            console.error("[MessagesContext] Error sending message via API:", err);
            showNotification(`Failed to send message: ${err?.message || 'Unknown error'}`, 'error');
            throw err;
        }
    }, [user, getToken, showNotification]);

    const editMessage = useCallback(async (messageId: string, content: string) => {
        // Optimistic update
        const originalMessages = [...messages];
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (!res.ok) throw new Error('Failed to edit message via API');
        } catch (err: any) {
            console.error("[MessagesContext] Error editing message:", err);
            setMessages(originalMessages); // Rollback
            showNotification(`Failed to edit message: ${err.message}`, 'error');
            throw err;
        }
    }, [messages, getToken, showNotification]);

    const deleteMessage = useCallback(async (messageId: string) => {
        // Optimistic update
        const originalMessages = [...messages];
        setMessages(prev => prev.filter(m => m.id !== messageId));

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete message via API');
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting message:", err);
            setMessages(originalMessages); // Rollback
            showNotification(`Failed to delete message: ${err.message}`, 'error');
            throw err;
        }
    }, [messages, getToken, showNotification]);

    const calculateCompatibility = useCallback((journeyDesc: string, requestMsg: string): { score: number; reason: string } => {
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
    }, []);

    const sendRequest = useCallback(async (journeyId: string, message: string = '', rating: number = 5.0, isVerified: boolean = true, audioUrl: string = '', boardingPassUrl: string = '') => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');

            const res = await fetch(`${apiUrl}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    requester_id: user.id,
                    requester_name: user.fullName || user.username || "Anonymous",
                    requester_avatar: user.imageUrl,
                    status: 'pending',
                    message,
                    requester_rating: rating,
                    requester_verified: isVerified,
                    requester_audio_url: audioUrl,
                    boarding_pass_url: boardingPassUrl
                })
            });

            if (!res.ok) throw new Error('Failed to send request via API');
            showNotification("Your request has been sent! We'll notify you once accepted.", 'success');
        } catch (err: any) {
            console.error("[MessagesContext] Error sending request via API:", err);
            showNotification(`Failed to send request: ${err.message}`, 'error');
        }
    }, [user, getToken, showNotification]);

    const getMutualCompanions = useCallback(async (userId1: string, userId2: string): Promise<string[]> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/requests/mutual/${userId1}/${userId2}`);
            if (res.ok) {
                return await res.json();
            }
            return [];
        } catch (err) {
            console.error("[MessagesContext] Error fetching mutual companions via API:", err);
            return [];
        }
    }, []);

    const getRequests = useCallback(async (journeyId: string): Promise<JourneyRequest[]> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/requests/journey/${journeyId}`);
            if (res.ok) {
                return await res.json();
            }
            return [];
        } catch (err) {
            console.error("[MessagesContext] Error fetching requests via API:", err);
            return [];
        }
    }, []);

    const updateRequestStatus = useCallback(async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/requests/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update request status via API');

            showNotification(`Traveler request ${status === 'accepted' ? 'approved' : 'declined'}.`, status === 'accepted' ? 'success' : 'info');
        } catch (err: any) {
            console.error("[MessagesContext] Error updating request status via API:", err);
            showNotification(`Failed to update request: ${err.message}`, 'error');
        }
    }, [getToken]);

    const leaveJourney = useCallback(async (journeyId: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/requests/journey/${journeyId}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to leave journey via API');

            setParticipatingJourneys(prev => prev.filter(id => id !== journeyId));
            setMyRequests(prev => ({ ...prev, [journeyId]: 'rejected' }));

            showNotification("You have left the journey discussion.", 'info');
        } catch (err: any) {
            console.error("[MessagesContext] Error leaving journey via API:", err);
            showNotification(`Failed to leave journey: ${err.message}`, 'error');
        }
    }, [getToken, user]);

    const setTypingStatus = useCallback((journeyId: string, isTyping: boolean) => {
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
    }, [user]);

    const checkRequestStatus = useCallback(async (journeyId: string): Promise<'pending' | 'accepted' | 'rejected' | 'none'> => {
        if (!user) return 'none';
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/requests/journey/${journeyId}/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                return data.status || 'none';
            }
            return 'none';
        } catch (err) {
            console.error("[MessagesContext] Error checking request status via API:", err);
            return 'none';
        }
    }, [getToken, user]);

    const subscribeToJourney = useCallback((journeyId: string, options?: {
        onItineraryChange?: () => void;
        onSouvenirChange?: () => void;
        onRequestsChange?: () => void;
    }) => {
        if (!supabase) return () => { };

        // Initial fetch
        fetchMessages(journeyId);

        // Initialize listener container if first time
        if (!listenersRef.current[journeyId]) {
            listenersRef.current[journeyId] = {
                onItineraryChange: new Set(),
                onSouvenirChange: new Set(),
                onRequestsChange: new Set(),
            };
        }

        // Add current callbacks to sets
        if (options?.onItineraryChange) listenersRef.current[journeyId].onItineraryChange.add(options.onItineraryChange);
        if (options?.onSouvenirChange) listenersRef.current[journeyId].onSouvenirChange.add(options.onSouvenirChange);
        if (options?.onRequestsChange) listenersRef.current[journeyId].onRequestsChange.add(options.onRequestsChange);

        // Track instance count
        subscriptionCountsRef.current[journeyId] = (subscriptionCountsRef.current[journeyId] || 0) + 1;

        // Only create/subscribe if this is the first instance
        if (subscriptionCountsRef.current[journeyId] === 1) {
            console.log(`[MessagesContext] Creating NEW realtime channel for journey ${journeyId}`);
            const channel = (supabase as any)
                .channel(`journey_main:${journeyId}`, {
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
                        console.log(`[MessagesContext] Realtime Event Received for journey ${journeyId}:`, payload.eventType, payload.new?.id);
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
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'journey_locations',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    (payload: any) => {
                        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                            setSquadLocations(prev => ({
                                ...prev,
                                [payload.new.user_id]: {
                                    userId: payload.new.user_id,
                                    userName: payload.new.user_name,
                                    lat: payload.new.lat,
                                    lng: payload.new.lng,
                                    updatedAt: payload.new.updated_at
                                }
                            }));
                        } else if (payload.eventType === 'DELETE') {
                            setSquadLocations(prev => {
                                const next = { ...prev };
                                delete next[payload.old.user_id];
                                return next;
                            });
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'journey_itinerary',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    () => {
                        listenersRef.current[journeyId]?.onItineraryChange.forEach(cb => cb());
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'journey_souvenirs',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    () => {
                        listenersRef.current[journeyId]?.onSouvenirChange.forEach(cb => cb());
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'journey_requests',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    () => {
                        listenersRef.current[journeyId]?.onRequestsChange.forEach(cb => cb());
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
        } else {
            console.log(`[MessagesContext] Re-using EXISTING realtime channel for journey ${journeyId}. Active subscriptions: ${subscriptionCountsRef.current[journeyId]}`);
        }

        return () => {
            const currentCount = subscriptionCountsRef.current[journeyId];
            if (currentCount === undefined) return;

            subscriptionCountsRef.current[journeyId] = currentCount - 1;

            const listeners = listenersRef.current[journeyId];
            if (listeners && options) {
                if (options.onItineraryChange) listeners.onItineraryChange.delete(options.onItineraryChange);
                if (options.onSouvenirChange) listeners.onSouvenirChange.delete(options.onSouvenirChange);
                if (options.onRequestsChange) listeners.onRequestsChange.delete(options.onRequestsChange);
            }

            // If last instance, cleanup channel
            if (subscriptionCountsRef.current[journeyId] === 0) {
                console.log(`[MessagesContext] Cleaning up REALTIME channel for journey ${journeyId}`);
                const channel = channelsRef.current[journeyId];
                if (channel) {
                    (supabase as any).removeChannel(channel);
                }
                delete channelsRef.current[journeyId];
                delete listenersRef.current[journeyId];
                delete subscriptionCountsRef.current[journeyId];

                setTypingUsers(prev => {
                    const next = { ...prev };
                    delete next[journeyId];
                    return next;
                });
            }
        };
    }, [fetchMessages, user?.id]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const addExpense = useCallback(async (journeyId: string, amount: number, description: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    payer_id: user.id,
                    payer_name: user.fullName || user.username || "Anonymous",
                    amount,
                    description,
                    currency: 'USD'
                })
            });
            if (!res.ok) throw new Error('Failed to add expense via API');
            showNotification("Expense added and shared with the group!", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error adding expense via API:", err);
            showNotification("Failed to add expense.", "error");
        }
    }, [user, getToken]);

    const getExpenses = useCallback(async (journeyId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/expenses/journey/${journeyId}`);
            if (res.ok) {
                return await res.json();
            }
            return [];
        } catch (err) {
            console.error("[MessagesContext] Error fetching expenses via API:", err);
            return [];
        }
    }, []);

    const updateExpense = useCallback(async (journeyId: string, expenseId: string, amount: number, description: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/expenses/${expenseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    payerId: user.id,
                    updates: { amount, description }
                })
            });
            if (!res.ok) throw new Error('Failed to update expense via API');

            await sendMessage(journeyId, `[EXPENSE UPDATED] ${description}: $${amount.toFixed(2)}`);
            showNotification("Expense updated.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error updating expense via API:", err);
            showNotification("Failed to update expense.", "error");
        }
    }, [user, getToken, sendMessage]);

    const deleteExpense = useCallback(async (journeyId: string, expenseId: string, description: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ payerId: user.id })
            });
            if (!res.ok) throw new Error('Failed to delete expense via API');

            await sendMessage(journeyId, `[EXPENSE REMOVED] ${description}`);
            showNotification("Expense removed.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting expense via API:", err);
            showNotification("Failed to delete expense.", "error");
        }
    }, [user, getToken, sendMessage]);

    const recordSettlement = useCallback(async (journeyId: string, amount: number, receiverId: string, receiverName: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    payer_id: user.id,
                    payer_name: user.firstName || "Traveler",
                    amount: amount,
                    description: `Settled balance with ${receiverName}`,
                    is_settlement: true,
                    receiver_id: receiverId,
                    currency: 'USD'
                })
            });
            if (!res.ok) throw new Error('Failed to record settlement via API');

            await sendMessage(journeyId, `[SETTLED] ${user.firstName} paid ${receiverName}: $${amount.toFixed(2)}`);
            showNotification(`Settlement recorded with ${receiverName}`, "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error recording settlement via API:", err);
            showNotification("Failed to record settlement.", "error");
        }
    }, [user, getToken, sendMessage]);

    const submitReview = useCallback(async (journeyId: string, revieweeId: string, rating: number, comment: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    reviewer_id: user.id,
                    reviewee_id: revieweeId,
                    rating,
                    comment
                })
            });
            if (!res.ok) throw new Error('Failed to submit review via API');
            showNotification("Thank you for your review!", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error submitting review via API:", err);
            showNotification("Failed to submit review.", "error");
        }
    }, [user, getToken]);

    const getEmergencyContacts = useCallback(async (journeyId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/security/journey/${journeyId}`);
            if (res.ok) {
                const data = await res.json();
                return (data || []).filter((c: any) => dayjs().isBefore(dayjs(c.expires_at)));
            }
            return [];
        } catch (err: any) {
            console.error("[MessagesContext] Error fetching emergency contacts via API:", err);
            return [];
        }
    }, []);

    const addSouvenir = useCallback(async (journey_id: string, image_url: string, caption: string) => {
        if (!user) return null;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/souvenirs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id,
                    user_id: user.id,
                    user_name: user.fullName || "Traveler",
                    user_avatar: user.imageUrl,
                    image_url,
                    caption
                })
            });
            if (!res.ok) throw new Error('Failed to add souvenir via API');
            const data = await res.json();
            showNotification("Memory added to souvenirs!", "success");
            return data;
        } catch (err: any) {
            console.error("[MessagesContext] Error adding souvenir via API:", err);
            showNotification(`Failed to add memory: ${err.message || 'Unknown error'}`, "error");
            return null;
        }
    }, [user, getToken]);

    const getSouvenirs = useCallback(async (journey_id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/souvenirs/journey/${journey_id}`);
            if (res.ok) {
                return await res.json();
            }
            return [];
        } catch (err) {
            console.error("[MessagesContext] Error fetching souvenirs via API:", err);
            return [];
        }
    }, []);

    const saveEmergencyContact = useCallback(async (journeyId: string, name: string, phone: string, relation: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/security/vault`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    user_id: user.id,
                    uploader_name: user.fullName || user.username || "A Participant",
                    contact_name: name,
                    contact_phone: phone,
                    relation,
                    expires_at: dayjs().add(7, 'day').toISOString()
                })
            });
            if (!res.ok) throw new Error('Failed to save contact via API');
            showNotification("Emergency contact updated in the Security Vault.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error saving contact via API:", err);
            showNotification("Failed to save contact.", "error");
        }
    }, [user, getToken]);

    const deleteEmergencyContact = useCallback(async (journeyId: string) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            const res = await fetch(`${apiUrl}/security/vault/${journeyId}/user/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete contact via API');
            showNotification("Your emergency contact has been removed.", "success");
        } catch (err: any) {
            console.error("[MessagesContext] Error deleting contact via API:", err);
            showNotification("Failed to delete contact.", "error");
        }
    }, [user, getToken]);

    const shareLocation = useCallback(async (journeyId: string, lat: number, lng: number) => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();
            if (!token) throw new Error('Authentication token is missing.');
            await fetch(`${apiUrl}/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: journeyId,
                    user_id: user.id,
                    user_name: user.firstName || "Traveler",
                    lat,
                    lng
                })
            });
        } catch (err: any) {
            console.error("[MessagesContext] Error sharing location via API:", err);
        }
    }, [user, getToken]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MessagesContext.Provider value={{
            messages,
            supabase,
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
            shareLocation,
            squadLocations,
            getExpenses,
            submitReview,
            getEmergencyContacts,
            saveEmergencyContact,
            deleteEmergencyContact,
            getSouvenirs,
            addSouvenir
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
