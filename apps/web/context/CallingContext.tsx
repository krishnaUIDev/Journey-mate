"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";

// Lazy load AgoraRTC helpers
let AgoraRTC: any = null;
let vbExtension: any = null;
let beautyExtension: any = null;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type CallState = "idle" | "dialing" | "incoming" | "active";

interface CallInfo {
    journeyId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    type: "audio" | "video";
}

interface ParticipantMetadata {
    [userId: string]: {
        name: string;
        avatar?: string;
    };
}

interface CallingContextType {
    callState: CallState;
    callInfo: CallInfo | null;
    localVideoTrack: ILocalVideoTrack | null;
    localAudioTrack: ILocalAudioTrack | null;
    remoteUsers: IAgoraRTCRemoteUser[];
    startCall: (journeyId: string, type: "audio" | "video") => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => Promise<void>;
    toggleBlur: () => Promise<void>;
    toggleBeauty: () => Promise<void>;
    isMuted: boolean;
    isVideoOff: boolean;
    isBlurEnabled: boolean;
    isBeautyEnabled: boolean;
    participantsMetadata: ParticipantMetadata;
}

const CallingContext = createContext<CallingContextType | undefined>(undefined);

const AGORA_APP_ID = (process.env.NEXT_PUBLIC_AGORA_APP_ID || "").trim();
const AGORA_TOKEN = (process.env.NEXT_PUBLIC_AGORA_TOKEN || "").trim();

export function CallingProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [callState, setCallState] = useState<CallState>("idle");
    const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isBlurEnabled, setIsBlurEnabled] = useState(false);
    const [isBeautyEnabled, setIsBeautyEnabled] = useState(false);
    const [participantsMetadata, setParticipantsMetadata] = useState<ParticipantMetadata>({});
    const [callStartTime, setCallStartTime] = useState<number | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const channelRef = useRef<any>(null);
    const missedCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
    const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
    const vbProcessorRef = useRef<any>(null);
    const beautyProcessorRef = useRef<any>(null);
    const callStateRef = useRef<CallState>("idle");
    const userRef = useRef<any>(null);
    const sessionChannelRef = useRef<any>(null);

    // Sync ref with user
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Sync ref with state
    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    useEffect(() => {
        if (!user) return;

        console.log("[CallingContext] Initializing stable invite channel for user:", user.id);
        const channel = supabase.channel(`calls:${user.id}`, {
            config: { broadcast: { self: false } }
        });

        channel
            .on("broadcast", { event: "call-invite" }, ({ payload }) => {
                if (callStateRef.current === "idle") {
                    setCallInfo(payload);
                    setCallState("incoming");
                }
            })
            .on("broadcast", { event: "call-accept" }, async () => {
                if (callStateRef.current === "dialing") {
                    if (missedCallTimeoutRef.current) {
                        clearTimeout(missedCallTimeoutRef.current);
                        missedCallTimeoutRef.current = null;
                    }
                    console.log("[CallingContext] Call accepted, initializing media...");
                    setCallState("active");
                    setCallStartTime(Date.now());
                }
            })
            .on("broadcast", { event: "call-reject" }, () => {
                if (callStateRef.current === "dialing") {
                    logCallEvent("declined");
                }
                setCallState("idle");
                setCallInfo(null);
            })
            .on("broadcast", { event: "call-end" }, async () => {
                await handleCleanup();
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            console.log("[CallingContext] Cleaning up stable invite channel");
            supabase.removeChannel(channel);
        };
    }, [user?.id]); // Only depend on User ID

    // Separate effect to handle media initialization when state transitions to active
    useEffect(() => {
        if (callState === "active" && callInfo && !clientRef.current) {
            initializeMedia(callInfo.journeyId, callInfo.type);
        }
    }, [callState, callInfo]);

    const logCallEvent = async (status: "missed" | "accepted" | "declined" | "finished", duration?: number) => {
        if (!callInfo || !user) return;

        try {
            const metadata = {
                status,
                type: callInfo.type,
                duration: duration || 0,
                callerId: callInfo.callerId,
                callerName: callInfo.callerName
            };

            const content = status === "missed" ? "Missed call"
                : status === "declined" ? "Declined call"
                    : `${callInfo.type === "video" ? "Video" : "Audio"} Call`;

            await supabase.from("journey_messages").insert({
                journey_id: callInfo.journeyId,
                sender_id: user.id,
                sender_name: user.fullName || "Traveler",
                sender_avatar: user.imageUrl,
                content,
                call_metadata: metadata
            });
        } catch (error) {
            console.error("[CallingContext] Error logging call event:", error);
        }
    };

    const handleCleanup = async () => {
        if (callStartTime && callState === "active") {
            const duration = Math.floor((Date.now() - callStartTime) / 1000);
            logCallEvent("finished", duration);
        }

        if (missedCallTimeoutRef.current) {
            clearTimeout(missedCallTimeoutRef.current);
            missedCallTimeoutRef.current = null;
        }

        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.stop();
            localVideoTrackRef.current.close();
            localVideoTrackRef.current = null;
        }
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.stop();
            localAudioTrackRef.current.close();
            localAudioTrackRef.current = null;
        }
        if (clientRef.current) {
            await clientRef.current.leave();
            clientRef.current = null;
        }

        vbProcessorRef.current = null;
        beautyProcessorRef.current = null;
        setCallState("idle");
        setCallInfo(null);
        setLocalVideoTrack(null);
        setLocalAudioTrack(null);
        setRemoteUsers([]);
        setCallStartTime(null);
        setIsMuted(false);
        setIsVideoOff(false);

        // Remove session channel
        if (sessionChannelRef.current) {
            supabase.removeChannel(sessionChannelRef.current);
            sessionChannelRef.current = null;
        }
    };

    const initializeMedia = async (channelName: string, type: "audio" | "video") => {
        if (!user) return;

        // On-demand Agora Loading
        if (!AgoraRTC) {
            console.log("[CallingContext] Dynamically importing Agora SDK...");
            const mod = await import("agora-rtc-sdk-ng");
            AgoraRTC = mod.default;

            try {
                const [vbMod, beautyMod] = await Promise.all([
                    import("agora-extension-virtual-background"),
                    import("agora-extension-beauty-effect")
                ]) as any;

                const VirtualBackgroundExtension = vbMod.default;
                const BeautyExtension = beautyMod.BeautyExtension || beautyMod.default;

                if (VirtualBackgroundExtension && BeautyExtension) {
                    vbExtension = new VirtualBackgroundExtension();
                    beautyExtension = new BeautyExtension();
                    AgoraRTC.registerExtensions([vbExtension, beautyExtension]);
                }
            } catch (err) {
                console.warn("[CallingContext] Extensions failed, continuing with base Agora:", err);
            }
        }

        try {
            const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            const updateRemoteUsers = () => {
                const currentUserId = userRef.current?.id;
                console.log("[CallingContext] updateRemoteUsers for currentUserId:", currentUserId);

                const remoteParticipants = client.remoteUsers;
                const seenBaseIds = new Set<string>();

                const filtered = remoteParticipants.filter((u: IAgoraRTCRemoteUser) => {
                    const uidStr = u.uid.toString();
                    if (!currentUserId) return true;

                    // 1. Filter out our own sessions
                    const isOurSession = uidStr.startsWith(`${currentUserId}_`) || uidStr === currentUserId;
                    if (isOurSession) return false;

                    // 2. Deduplicate: only show one box per remote User ID
                    // Extract base ID (everything before the last underscore)
                    const baseId = uidStr.includes("_") ? uidStr.substring(0, uidStr.lastIndexOf("_")) : uidStr;

                    if (seenBaseIds.has(baseId)) {
                        console.log("[CallingContext] Filtering out duplicate session for user:", baseId);
                        return false;
                    }

                    seenBaseIds.add(baseId);
                    return true;
                });

                console.log("[CallingContext] Final remote UIDs:", filtered.map((u: IAgoraRTCRemoteUser) => u.uid.toString()));
                setRemoteUsers([...filtered]);
            };

            client.on("user-joined", (remoteUser: IAgoraRTCRemoteUser) => {
                console.log("[CallingContext] user-joined:", remoteUser.uid);
                updateRemoteUsers();
            });

            client.on("user-left", async (remoteUser: IAgoraRTCRemoteUser) => {
                console.log("[CallingContext] user-left:", remoteUser.uid);
                updateRemoteUsers();

                // In a 1-on-1 app, if the partner leaves, the call is over
                console.log("[CallingContext] Partner left, triggering local cleanup");
                await handleCleanup();
            });

            client.on("user-published", async (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
                const currentUserId = userRef.current?.id;
                if (currentUserId && (remoteUser.uid.toString().startsWith(`${currentUserId}_`) || remoteUser.uid.toString() === currentUserId)) {
                    console.log("[CallingContext] Skipping subscription for self-session:", remoteUser.uid);
                    return;
                }

                console.log("[CallingContext] user-published:", remoteUser.uid, mediaType);
                await client.subscribe(remoteUser, mediaType);
                if (mediaType === "audio") {
                    remoteUser.audioTrack?.play();
                }
                updateRemoteUsers();
            });

            client.on("user-unpublished", (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
                console.log("[CallingContext] user-unpublished:", remoteUser.uid, mediaType);
                updateRemoteUsers();
            });

            const sessionUid = `${user.id}_${Math.floor(Math.random() * 10000)}`;
            console.log("[CallingContext] Joining with UID:", sessionUid);
            await client.join(AGORA_APP_ID, channelName, AGORA_TOKEN || null, sessionUid);

            // Safety check: was the call ended while we were joining?
            if (callStateRef.current !== "active") {
                console.log("[CallingContext] Call ended during join, leaving Agora channel.");
                await client.leave();
                return;
            }

            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            localAudioTrackRef.current = audioTrack;
            setLocalAudioTrack(audioTrack);

            if (type === "video") {
                const videoTrack = await AgoraRTC.createCameraVideoTrack();
                localVideoTrackRef.current = videoTrack;
                setLocalVideoTrack(videoTrack);
                await setupVideoPipeline(videoTrack);

                if (callStateRef.current === "active") {
                    await client.publish([audioTrack, videoTrack]);
                } else {
                    console.log("[CallingContext] Call ended, closing tracks...");
                    audioTrack.close();
                    videoTrack.close();
                }
            } else {
                if (callStateRef.current === "active") {
                    await client.publish([audioTrack]);
                } else {
                    console.log("[CallingContext] Call ended, closing track...");
                    audioTrack.close();
                }
                setIsVideoOff(true);
            }

            // JOIN SESSION CHANNEL for mid-call coordination (end-call, etc)
            const sessionChannel = supabase.channel(`call_session:${channelName}`);
            sessionChannelRef.current = sessionChannel;

            sessionChannel
                .on("broadcast", { event: "call-end" }, async () => {
                    console.log("[CallingContext] Received call-end signal, cleaning up...");
                    await handleCleanup();
                })
                .subscribe();

        } catch (error) {
            console.error("[CallingContext] Failed to initialize media:", error);
            handleCleanup();
        }
    };

    const fetchParticipantsMetadata = async (journeyId: string) => {
        try {
            const { data: journey } = await supabase
                .from("journeys")
                .select("user_id, user_name, user_avatar")
                .eq("id", journeyId)
                .single();

            const { data: requesters } = await supabase
                .from("journey_requests")
                .select("requester_id, requester_name, requester_avatar")
                .eq("journey_id", journeyId)
                .eq("status", "accepted");

            const metadata: ParticipantMetadata = {};
            if (journey) {
                metadata[journey.user_id] = { name: journey.user_name || "Owner", avatar: journey.user_avatar };
            }
            requesters?.forEach(r => {
                metadata[r.requester_id] = { name: r.requester_name || "Traveler", avatar: r.requester_avatar };
            });

            setParticipantsMetadata(prev => ({ ...prev, ...metadata }));
        } catch (error) {
            console.error("[CallingContext] Error fetching participants metadata:", error);
        }
    };

    const startCall = async (journeyId: string, type: "audio" | "video") => {
        if (!user) return;

        setCallState("dialing");
        await fetchParticipantsMetadata(journeyId);

        const info: CallInfo = {
            journeyId,
            callerId: user.id,
            callerName: user.fullName || "Traveler",
            callerAvatar: user.imageUrl,
            type
        };
        setCallInfo(info);

        try {
            const { data: journey } = await supabase
                .from("journeys")
                .select("user_id")
                .eq("id", journeyId)
                .single();

            const { data: participants } = await supabase
                .from("journey_requests")
                .select("requester_id")
                .eq("journey_id", journeyId)
                .eq("status", "accepted");

            const targetUserIds = new Set([
                journey?.user_id,
                ...(participants?.map((p: any) => p.requester_id) || [])
            ]);

            targetUserIds.delete(user.id);

            for (const targetId of Array.from(targetUserIds)) {
                if (!targetId) continue;
                const targetChannel = supabase.channel(`calls:${targetId}`);
                targetChannel.subscribe(async (status: string) => {
                    if (status === "SUBSCRIBED") {
                        await targetChannel.send({
                            type: "broadcast",
                            event: "call-invite",
                            payload: info
                        });
                        // Cleanup target channel immediately after sending
                        setTimeout(() => {
                            supabase.removeChannel(targetChannel);
                        }, 2000);
                    }
                });
            }

            missedCallTimeoutRef.current = setTimeout(async () => {
                if (callState === "dialing") {
                    logCallEvent("missed");
                    await handleCleanup();
                }
            }, 45000);
        } catch (error) {
            console.error("[CallingContext] Error starting call:", error);
            setCallState("idle");
            setCallInfo(null);
        }
    };

    const acceptCall = async () => {
        if (!callInfo || !user) return;

        if (missedCallTimeoutRef.current) {
            clearTimeout(missedCallTimeoutRef.current);
            missedCallTimeoutRef.current = null;
        }

        setCallState("active");
        setCallStartTime(Date.now());
        await fetchParticipantsMetadata(callInfo.journeyId);

        // Notify caller
        const callerChannel = supabase.channel(`calls:${callInfo.callerId}`);
        await callerChannel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await callerChannel.send({
                    type: "broadcast",
                    event: "call-accept",
                    payload: { acceptorId: user.id }
                });
                // Cleanup
                setTimeout(() => {
                    supabase.removeChannel(callerChannel);
                }, 2000);
            }
        });

        // Initialize media for the respondent
        await initializeMedia(callInfo.journeyId, callInfo.type);
    };

    const rejectCall = () => {
        if (callInfo) {
            const callerChannel = supabase.channel(`calls:${callInfo.callerId}`);
            callerChannel.subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await callerChannel.send({
                        type: "broadcast",
                        event: "call-reject",
                        payload: { rejectorId: user?.id }
                    });
                    logCallEvent("declined");
                    setTimeout(() => {
                        supabase.removeChannel(callerChannel);
                    }, 2000);
                }
            });
        }
        setCallState("idle");
        setCallInfo(null);
    };

    const endCall = async () => {
        if (callInfo) {
            // Signal to everyone in the session
            const sessionChannel = supabase.channel(`call_session:${callInfo.journeyId}`);
            await sessionChannel.send({
                type: "broadcast",
                event: "call-end",
                payload: { finisherId: user?.id }
            });
        }
        await handleCleanup();
    };

    const toggleMute = () => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = async () => {
        if (localVideoTrackRef.current) {
            const newState = !isVideoOff;
            await localVideoTrackRef.current.setEnabled(!newState);
            setIsVideoOff(newState);
        } else if (callState === "active" && clientRef.current && AgoraRTC) {
            // Upgrade Audio -> Video
            try {
                const videoTrack = await AgoraRTC.createCameraVideoTrack();
                localVideoTrackRef.current = videoTrack;
                setLocalVideoTrack(videoTrack);
                await setupVideoPipeline(videoTrack);
                await clientRef.current.publish(videoTrack);
                setIsVideoOff(false);
            } catch (error) {
                console.error("[CallingContext] Failed to enable video:", error);
            }
        }
    };

    const setupVideoPipeline = async (track: ILocalVideoTrack) => {
        const vbExtension = (window as any).vbExtension;
        const beautyExtension = (window as any).beautyExtension;
        if (!vbExtension || !beautyExtension) return;

        try {
            if (!vbProcessorRef.current) {
                vbProcessorRef.current = vbExtension.createProcessor();
                await vbProcessorRef.current.init();
            }
            if (!beautyProcessorRef.current) {
                beautyProcessorRef.current = beautyExtension.createProcessor();
            }

            // Establish the LINEAR pipe chain: Track -> Blur -> Beauty -> Destination
            track.pipe(vbProcessorRef.current)
                .pipe(beautyProcessorRef.current)
                .pipe(track.processorDestination);

            // Sync initial state
            if (isBlurEnabled) {
                await vbProcessorRef.current.setOptions({ type: 'blur', blurDegree: 2 });
                await vbProcessorRef.current.enable();
            }
            if (isBeautyEnabled) {
                await beautyProcessorRef.current.setOptions({
                    lighteningLevel: 0.7,
                    rednessLevel: 0.1,
                    smoothnessLevel: 0.5,
                    sharpeningLevel: 0.3
                });
                await beautyProcessorRef.current.enable();
            }
        } catch (error) {
            console.error("[CallingContext] Pipeline setup failed:", error);
        }
    };

    const toggleBlur = async () => {
        if (!vbProcessorRef.current) return;

        try {
            if (isBlurEnabled) {
                await vbProcessorRef.current.disable();
            } else {
                await vbProcessorRef.current.setOptions({ type: 'blur', blurDegree: 2 });
                await vbProcessorRef.current.enable();
            }
            setIsBlurEnabled(!isBlurEnabled);
        } catch (error) {
            console.error("[CallingContext] Failed to toggle blur:", error);
        }
    };

    const toggleBeauty = async () => {
        if (!beautyProcessorRef.current) return;

        try {
            if (isBeautyEnabled) {
                await beautyProcessorRef.current.disable();
            } else {
                await beautyProcessorRef.current.setOptions({
                    lighteningLevel: 0.7,
                    rednessLevel: 0.1,
                    smoothnessLevel: 0.5,
                    sharpeningLevel: 0.3
                });
                await beautyProcessorRef.current.enable();
            }
            setIsBeautyEnabled(!isBeautyEnabled);
        } catch (error) {
            console.error("[CallingContext] Failed to toggle beauty:", error);
        }
    };

    return (
        <CallingContext.Provider value={{
            callState,
            callInfo,
            localVideoTrack,
            localAudioTrack,
            remoteUsers,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            toggleMute,
            toggleVideo,
            toggleBlur,
            toggleBeauty,
            isMuted,
            isVideoOff,
            isBlurEnabled,
            isBeautyEnabled,
            participantsMetadata
        }}>
            {children}
        </CallingContext.Provider>
    );
}

export function useCalling() {
    const context = useContext(CallingContext);
    if (!context) throw new Error("useCalling must be used within a CallingProvider");
    return context;
}
