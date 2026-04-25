"use client";

import React, { useEffect, useRef } from "react";
import {
    Box,
    Paper,
    Typography,
    Avatar,
    IconButton,
    Portal,
    Fade,
    Zoom,
} from "@mui/material";
import {
    Call as CallIcon,
    CallEnd as EndCallIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Videocam as VideoIcon,
    VideocamOff as VideoOffIcon,
    BlurOn as BlurIcon,
    AutoFixHigh as BeautyIcon,
} from "@mui/icons-material";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { useCalling } from "../../../context/CallingContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export function CallOverlay() {
    const { user } = useUser();
    const {
        callState,
        callInfo,
        localVideoTrack,
        remoteUsers,
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
    } = useCalling();

    const localVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }
    }, [localVideoTrack]);

    if (callState === "idle") return null;

    const isIncoming = callState === "incoming";

    return (
        <Portal>
            {/* Main Container: Full screen only if NOT incoming */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                bgcolor: isIncoming ? 'transparent' : 'rgba(0,0,0,0.85)',
                backdropFilter: isIncoming ? 'none' : 'blur(10px)',
                display: 'flex',
                alignItems: isIncoming ? 'flex-start' : 'center',
                justifyContent: 'center',
                p: isIncoming ? 2 : 3,
                pointerEvents: isIncoming ? 'none' : 'auto', // Allow clicking through if incoming
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Incoming Call Notification (Compact Banner) */}
                {isIncoming && callInfo && (
                    <Zoom in={true}>
                        <Paper
                            elevation={10}
                            sx={{
                                px: 1,
                                py: 1,
                                borderRadius: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: '#1e293b',
                                color: 'white',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                pointerEvents: 'auto', // Enable pointer events for the banner itself
                                border: '1px solid rgba(255,255,255,0.1)',
                                minWidth: { xs: 'calc(100% - 16px)', sm: 320 },
                                maxWidth: { xs: 'calc(100% - 16px)', sm: 400 },
                                mt: 2
                            }}
                        >
                            <Avatar
                                src={callInfo.callerAvatar}
                                sx={{ width: 44, height: 44, border: '2px solid #22c55e' }}
                            />
                            <Box sx={{ flex: 1, ml: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{callInfo.callerName}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                    Incoming {callInfo.type} call...
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    onClick={acceptCall}
                                    aria-label="Accept call"
                                    sx={{
                                        bgcolor: '#22c55e',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#16a34a' },
                                        width: 44,
                                        height: 44
                                    }}
                                >
                                    <CallIcon />
                                </IconButton>
                                <IconButton
                                    onClick={rejectCall}
                                    aria-label="Reject call"
                                    sx={{
                                        bgcolor: '#ef4444',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#dc2626' },
                                        width: 44,
                                        height: 44
                                    }}
                                >
                                    <EndCallIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Zoom>
                )}

                {/* Dialing State (Full Screen) */}
                {callState === "dialing" && callInfo && (
                    <Fade in={true}>
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                            <Avatar
                                src={user?.imageUrl}
                                sx={{ width: 120, height: 120, mx: 'auto', mb: 3, animation: 'pulse 2s infinite' }}
                            />
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Calling...</Typography>
                            <Typography sx={{ opacity: 0.7, mb: 4 }}>Waiting for partner to join</Typography>
                            <IconButton
                                onClick={endCall}
                                aria-label="Cancel outgoing call"
                                sx={{ bgcolor: '#ef4444', color: 'white', width: 64, height: 64, '&:hover': { bgcolor: '#dc2626' } }}
                            >
                                <EndCallIcon />
                            </IconButton>
                        </Box>
                    </Fade>
                )}

                {/* Active Call Grid (Full Screen) */}
                {callState === "active" && (
                    <Fade in={true}>
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1, sm: 0 } }}>
                            <Box sx={{
                                flex: 1,
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: remoteUsers.length > 0 ? '1fr 1fr' : '1fr' },
                                gap: 2,
                                overflowY: 'auto'
                            }}>
                                {/* Local Video */}
                                <Box sx={{
                                    position: 'relative',
                                    bgcolor: '#0f172a',
                                    borderRadius: '1.5rem',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div ref={localVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isVideoOff && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white/10">
                                                <Image
                                                    src={user?.imageUrl || ""}
                                                    alt={`${user?.fullName}'s avatar`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <Box sx={{ position: 'absolute', bottom: 20, left: 20, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', px: 2, py: 0.5, borderRadius: '1rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{user?.fullName || "You"}</Typography>
                                    </Box>
                                </Box>

                                {/* Remote Videos */}
                                {remoteUsers.map(remoteUser => (
                                    <RemoteVideoPlayer
                                        key={remoteUser.uid}
                                        user={remoteUser}
                                        metadata={participantsMetadata[remoteUser.uid.toString().includes("_")
                                            ? remoteUser.uid.toString().substring(0, remoteUser.uid.toString().lastIndexOf("_"))
                                            : remoteUser.uid.toString()]}
                                    />
                                ))}
                            </Box>

                            {/* Controls */}
                            <Paper sx={{
                                p: { xs: 1, sm: 2 },
                                borderRadius: '2rem',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                display: 'flex',
                                gap: { xs: 1, sm: 2 },
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignSelf: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                maxWidth: '100%'
                            }}>
                                <IconButton onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} sx={{ color: 'white', bgcolor: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)' }}>
                                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                                </IconButton>
                                <IconButton onClick={toggleVideo} aria-label={isVideoOff ? "Turn on video" : "Turn off video"} sx={{ color: 'white', bgcolor: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.1)' }}>
                                    {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
                                </IconButton>

                                {!isVideoOff && (
                                    <>
                                        <IconButton
                                            onClick={toggleBlur}
                                            aria-label={isBlurEnabled ? "Disable Background Blur" : "Enable Background Blur"}
                                            sx={{ color: 'white', bgcolor: isBlurEnabled ? '#3b82f6' : 'rgba(255,255,255,0.1)' }}
                                        >
                                            <BlurIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={toggleBeauty}
                                            aria-label={isBeautyEnabled ? "Disable Beauty Filter" : "Enable Beauty Filter"}
                                            sx={{ color: 'white', bgcolor: isBeautyEnabled ? '#d946ef' : 'rgba(255,255,255,0.1)' }}
                                        >
                                            <BeautyIcon />
                                        </IconButton>
                                    </>
                                )}

                                <IconButton
                                    onClick={endCall}
                                    sx={{ bgcolor: '#ef4444', color: 'white', '&:hover': { bgcolor: '#dc2626' } }}
                                >
                                    <EndCallIcon />
                                </IconButton>
                            </Paper>
                        </Box>
                    </Fade>
                )}
            </Box>

            <style jsx global>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </Portal>
    );
}

function RemoteVideoPlayer({ user, metadata }: { user: IAgoraRTCRemoteUser, metadata?: { name: string, avatar?: string } }) {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user.videoTrack && videoRef.current) {
            user.videoTrack.play(videoRef.current);
        }
    }, [user.videoTrack]);

    return (
        <Box sx={{
            position: 'relative',
            bgcolor: '#0f172a',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!user.hasVideo && (
                <Avatar
                    src={metadata?.avatar}
                    sx={{ width: 120, height: 120, position: 'absolute', border: '4px solid rgba(255,255,255,0.1)' }}
                >
                    {metadata?.name?.charAt(0) || "P"}
                </Avatar>
            )}
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', px: 2, py: 0.5, borderRadius: '1rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>{metadata?.name || "Partner"}</Typography>
            </Box>
        </Box>
    );
}
