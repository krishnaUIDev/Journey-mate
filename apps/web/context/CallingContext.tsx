"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { createClient } from "@supabase/supabase-js";
import { useUser, useAuth } from "@clerk/nextjs";

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
    localScreenTrack: ILocalVideoTrack | null;
    remoteUsers: IAgoraRTCRemoteUser[];
    startCall: (journeyId: string, type: "audio" | "video") => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => Promise<void>;
    toggleScreenShare: () => Promise<void>;
    toggleBlur: () => Promise<void>;
    toggleBeauty: () => Promise<void>;
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    isBlurEnabled: boolean;
    isBeautyEnabled: boolean;
    participantsMetadata: ParticipantMetadata;
}

const CallingContext = createContext<CallingContextType | undefined>(undefined);

const AGORA_APP_ID = (process.env.NEXT_PUBLIC_AGORA_APP_ID || "").trim();
const AGORA_TOKEN = (process.env.NEXT_PUBLIC_AGORA_TOKEN || "").trim();

export function CallingProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [callState, setCallState] = useState<CallState>("idle");
    const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
    const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isBlurEnabled, setIsBlurEnabled] = useState(false);
    const [isBeautyEnabled, setIsBeautyEnabled] = useState(false);
    const [participantsMetadata, setParticipantsMetadata] = useState<ParticipantMetadata>({});
    const [callStartTime, setCallStartTime] = useState<number | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const channelRef = useRef<any>(null);
    const missedCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
    const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
    const localScreenTrackRef = useRef<ILocalVideoTrack | null>(null);
    const vbProcessorRef = useRef<any>(null);
    const beautyProcessorRef = useRef<any>(null);
    const callStateRef = useRef<CallState>("idle");
    const userRef = useRef<any>(null);
    const sessionChannelRef = useRef<any>(null);

    // --- 1. UTILITY FUNCTIONS ---

    const logCallEvent = useCallback(async (status: "missed" | "accepted" | "declined" | "finished", duration?: number) => {
        if (!callInfo || !user) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const token = await getToken();

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

            await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    journey_id: callInfo.journeyId,
                    sender_id: user.id,
                    sender_name: user.fullName || "Traveler",
                    sender_avatar: user.imageUrl,
                    content,
                    call_metadata: metadata,
                    is_system: false
                })
            });
        } catch (error) {
            console.error("[CallingContext] Error logging call event via API:", error);
        }
    }, [callInfo, user, getToken]);

    const handleCleanup = useCallback(async () => {
        if (callStartTime && callStateRef.current === "active") {
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
        if (localScreenTrackRef.current) {
            localScreenTrackRef.current.stop();
            localScreenTrackRef.current.close();
            localScreenTrackRef.current = null;
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
        setLocalScreenTrack(null);
        setRemoteUsers([]);
        setCallStartTime(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setIsScreenSharing(false);

        if (sessionChannelRef.current) {
            supabase.removeChannel(sessionChannelRef.current);
            sessionChannelRef.current = null;
        }
    }, [callStartTime, logCallEvent]);

    const fetchParticipantsMetadata = useCallback(async (journeyId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const journeyRes = await fetch(`${apiUrl}/journeys/${journeyId}`);
            const journey = journeyRes.ok ? await journeyRes.json() : null;

            const reqRes = await fetch(`${apiUrl}/requests/journey/${journeyId}/accepted`);
            const requesters = reqRes.ok ? await reqRes.json() : [];

            const metadata: ParticipantMetadata = {};
            if (journey) {
                metadata[journey.user_id] = { name: journey.user_name || "Owner", avatar: journey.user_avatar };
            }
            requesters?.forEach((r: any) => {
                metadata[r.requester_id] = { name: r.requester_name || "Traveler", avatar: r.requester_avatar };
            });

            setParticipantsMetadata(prev => ({ ...prev, ...metadata }));
        } catch (error) {
            console.error("[CallingContext] Error fetching participants metadata via API:", error);
        }
    }, []);

    // --- 2. MEDIA PIPELINE ---

    const setupVideoPipeline = useCallback(async (track: ILocalVideoTrack) => {
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

            track.pipe(vbProcessorRef.current)
                .pipe(beautyProcessorRef.current)
                .pipe(track.processorDestination);

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
    }, [isBlurEnabled, isBeautyEnabled]);

    const initializeMedia = useCallback(async (channelName: string, type: "audio" | "video") => {
        if (!user) return;

        if (!AgoraRTC) {
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
                console.warn("[CallingContext] Extensions failed:", err);
            }
        }

        try {
            const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            const updateRemoteUsers = () => {
                const currentUserId = userRef.current?.id;
                const remoteParticipants = client.remoteUsers;
                const seenBaseIds = new Set<string>();

                const filtered = remoteParticipants.filter((u: IAgoraRTCRemoteUser) => {
                    const uidStr = u.uid.toString();
                    if (!currentUserId) return true;
                    if (uidStr.startsWith(`${currentUserId}_`) || uidStr === currentUserId) return false;
                    const baseId = uidStr.includes("_") ? uidStr.substring(0, uidStr.lastIndexOf("_")) : uidStr;
                    if (seenBaseIds.has(baseId)) return false;
                    seenBaseIds.add(baseId);
                    return true;
                });
                setRemoteUsers([...filtered]);
            };

            client.on("user-joined", updateRemoteUsers);
            client.on("user-left", async () => {
                updateRemoteUsers();
                await handleCleanup();
            });

            client.on("user-published", async (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
                const currentUserId = userRef.current?.id;
                if (currentUserId && (remoteUser.uid.toString().startsWith(`${currentUserId}_`) || remoteUser.uid.toString() === currentUserId)) return;

                await client.subscribe(remoteUser, mediaType);
                if (mediaType === "audio") remoteUser.audioTrack?.play();
                updateRemoteUsers();
            });

            client.on("user-unpublished", updateRemoteUsers);

            const sessionUid = `${user.id}_${Math.floor(Math.random() * 10000)}`;
            await client.join(AGORA_APP_ID, channelName, AGORA_TOKEN || null, sessionUid);

            if (callStateRef.current !== "active") {
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
                    audioTrack.close();
                    videoTrack.close();
                }
            } else {
                if (callStateRef.current === "active") {
                    await client.publish([audioTrack]);
                } else {
                    audioTrack.close();
                }
                setIsVideoOff(true);
            }

            const sessionChannel = supabase.channel(`call_session:${channelName}`);
            sessionChannelRef.current = sessionChannel;
            sessionChannel.on("broadcast", { event: "call-end" }, handleCleanup).subscribe();

        } catch (error) {
            console.error("[CallingContext] Failed to initialize media:", error);
            handleCleanup();
        }
    }, [user, handleCleanup, setupVideoPipeline]);

    // --- 3. CALL MANAGEMENT ---

    const startCall = useCallback(async (journeyId: string, type: "audio" | "video") => {
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
            const { data: journey } = await supabase.from("journeys").select("user_id").eq("id", journeyId).single();
            const { data: participants } = await supabase.from("journey_requests").select("requester_id").eq("journey_id", journeyId).eq("status", "accepted");

            const targetUserIds = new Set([journey?.user_id, ...(participants?.map((p: any) => p.requester_id) || [])]);
            targetUserIds.delete(user.id);

            for (const targetId of Array.from(targetUserIds)) {
                if (!targetId) continue;
                const targetChannel = supabase.channel(`calls:${targetId}`);
                targetChannel.subscribe((status: string) => {
                    if (status === "SUBSCRIBED") {
                        targetChannel.send({ type: "broadcast", event: "call-invite", payload: info });
                        setTimeout(() => supabase.removeChannel(targetChannel), 2000);
                    }
                });
            }

            missedCallTimeoutRef.current = setTimeout(async () => {
                if (callStateRef.current === "dialing") {
                    logCallEvent("missed");
                    await handleCleanup();
                }
            }, 45000);
        } catch (error) {
            console.error("[CallingContext] Error starting call:", error);
            setCallState("idle");
            setCallInfo(null);
        }
    }, [user, fetchParticipantsMetadata, logCallEvent, handleCleanup]);

    const acceptCall = useCallback(async () => {
        if (!callInfo || !user) return;
        if (missedCallTimeoutRef.current) {
            clearTimeout(missedCallTimeoutRef.current);
            missedCallTimeoutRef.current = null;
        }
        setCallState("active");
        setCallStartTime(Date.now());
        await fetchParticipantsMetadata(callInfo.journeyId);

        const callerChannel = supabase.channel(`calls:${callInfo.callerId}`);
        await callerChannel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                callerChannel.send({ type: "broadcast", event: "call-accept", payload: { acceptorId: user.id } });
                setTimeout(() => supabase.removeChannel(callerChannel), 2000);
            }
        });
        await initializeMedia(callInfo.journeyId, callInfo.type);
    }, [callInfo, user, fetchParticipantsMetadata, initializeMedia]);

    const rejectCall = useCallback(() => {
        if (callInfo) {
            const callerChannel = supabase.channel(`calls:${callInfo.callerId}`);
            callerChannel.subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    callerChannel.send({ type: "broadcast", event: "call-reject", payload: { rejectorId: user?.id } });
                    logCallEvent("declined");
                    setTimeout(() => supabase.removeChannel(callerChannel), 2000);
                }
            });
        }
        setCallState("idle");
        setCallInfo(null);
    }, [callInfo, user?.id, logCallEvent]);

    const endCall = useCallback(async () => {
        if (callInfo) {
            const sessionChannel = supabase.channel(`call_session:${callInfo.journeyId}`);
            await sessionChannel.send({ type: "broadcast", event: "call-end", payload: { finisherId: user?.id } });
        }
        await handleCleanup();
    }, [callInfo, user?.id, handleCleanup]);

    // --- 4. TOGGLES ---

    const toggleMute = useCallback(() => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const toggleVideo = useCallback(async () => {
        if (localVideoTrackRef.current) {
            const newState = !isVideoOff;
            await localVideoTrackRef.current.setEnabled(!newState);
            setIsVideoOff(newState);
        } else if (callStateRef.current === "active" && clientRef.current && AgoraRTC) {
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
    }, [isVideoOff, setupVideoPipeline]);

    const toggleScreenShare = useCallback(async () => {
        if (!clientRef.current || !AgoraRTC) return;

        try {
            if (isScreenSharing) {
                if (localScreenTrackRef.current) {
                    await clientRef.current.unpublish(localScreenTrackRef.current);
                    localScreenTrackRef.current.stop();
                    localScreenTrackRef.current.close();
                    localScreenTrackRef.current = null;
                    setLocalScreenTrack(null);
                }
                setIsScreenSharing(false);
                if (!isVideoOff && localVideoTrackRef.current) {
                    await clientRef.current.publish(localVideoTrackRef.current);
                }
            } else {
                const screenTrack = await AgoraRTC.createScreenVideoTrack({
                    encoderConfig: "1080p_1",
                    optimizationMode: "detail",
                    screenSourceType: "window"
                }, "auto");

                // Use ref or a separate handler to avoid recursive dependency
                screenTrack.on("track-ended", () => {
                    // Manual trigger to stop sharing
                    if (localScreenTrackRef.current) {
                        clientRef.current?.unpublish(localScreenTrackRef.current);
                        localScreenTrackRef.current.stop();
                        localScreenTrackRef.current.close();
                        localScreenTrackRef.current = null;
                        setLocalScreenTrack(null);
                        setIsScreenSharing(false);
                    }
                });

                localScreenTrackRef.current = screenTrack;
                setLocalScreenTrack(screenTrack);
                setIsScreenSharing(true);
                if (localVideoTrackRef.current) {
                    await clientRef.current.unpublish(localVideoTrackRef.current);
                }
                await clientRef.current.publish(screenTrack);
            }
        } catch (error: any) {
            console.error("[CallingContext] Screen share failed:", error);
            setIsScreenSharing(false);
        }
    }, [isScreenSharing, isVideoOff]);

    const toggleBlur = useCallback(async () => {
        if (!vbProcessorRef.current) return;
        try {
            if (isBlurEnabled) await vbProcessorRef.current.disable();
            else {
                await vbProcessorRef.current.setOptions({ type: 'blur', blurDegree: 2 });
                await vbProcessorRef.current.enable();
            }
            setIsBlurEnabled(!isBlurEnabled);
        } catch (error) {
            console.error("[CallingContext] Failed to toggle blur:", error);
        }
    }, [isBlurEnabled]);

    const toggleBeauty = useCallback(async () => {
        if (!beautyProcessorRef.current) return;
        try {
            if (isBeautyEnabled) await beautyProcessorRef.current.disable();
            else {
                await beautyProcessorRef.current.setOptions({ lighteningLevel: 0.7, rednessLevel: 0.1, smoothnessLevel: 0.5, sharpeningLevel: 0.3 });
                await beautyProcessorRef.current.enable();
            }
            setIsBeautyEnabled(!isBeautyEnabled);
        } catch (error) {
            console.error("[CallingContext] Failed to toggle beauty:", error);
        }
    }, [isBeautyEnabled]);

    // --- 5. EFFECTS ---

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { callStateRef.current = callState; }, [callState]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel(`calls:${user.id}`, { config: { broadcast: { self: false } } });
        channel
            .on("broadcast", { event: "call-invite" }, ({ payload }) => {
                if (callStateRef.current === "idle") {
                    setCallInfo(payload);
                    setCallState("incoming");
                }
            })
            .on("broadcast", { event: "call-accept" }, () => {
                if (callStateRef.current === "dialing") {
                    if (missedCallTimeoutRef.current) {
                        clearTimeout(missedCallTimeoutRef.current);
                        missedCallTimeoutRef.current = null;
                    }
                    setCallState("active");
                    setCallStartTime(Date.now());
                }
            })
            .on("broadcast", { event: "call-reject" }, () => {
                if (callStateRef.current === "dialing") logCallEvent("declined");
                setCallState("idle");
                setCallInfo(null);
            })
            .on("broadcast", { event: "call-end" }, handleCleanup)
            .subscribe();

        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [user?.id, logCallEvent, handleCleanup]);

    useEffect(() => {
        if (callState === "active" && callInfo && !clientRef.current) {
            initializeMedia(callInfo.journeyId, callInfo.type);
        }
    }, [callState, callInfo, initializeMedia]);

    return (
        <CallingContext.Provider value={{
            callState, callInfo, localVideoTrack, localAudioTrack, localScreenTrack, remoteUsers,
            startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, toggleScreenShare,
            toggleBlur, toggleBeauty, isMuted, isVideoOff, isScreenSharing, isBlurEnabled, isBeautyEnabled,
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
