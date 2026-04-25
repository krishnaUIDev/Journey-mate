"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Typography,
    Avatar,
    Button,
    Paper,
    CircularProgress,
    Stack,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    Check as AcceptIcon,
    Close as RejectIcon,
    Group as GroupIcon,
    ErrorOutlined as EmptyIcon,
    Verified as VerifiedIcon,
    Star as StarIcon,
    MessageOutlined as MessageIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon
} from "@mui/icons-material";
import { useMessages, JourneyRequest } from "../../../context/MessagesContext";

interface RequestCardProps {
    request: JourneyRequest;
    onAction: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
}

function RequestCard({ request, onAction }: RequestCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: '1.5rem',
                bgcolor: 'rgba(0,0,0,0.02)',
                '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={request.requester_avatar}
                            alt={request.requester_name}
                            sx={{ width: 44, height: 44, borderRadius: '14px', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        {request.requester_verified && (
                            <Box sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                bgcolor: '#0ea5e9',
                                borderRadius: '4px',
                                p: 0.2,
                                border: '2px solid white',
                                '.dark &': { border: '2px solid #18181b' },
                                display: 'flex'
                            }}>
                                <VerifiedIcon sx={{ fontSize: 10, color: 'white' }} />
                            </Box>
                        )}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{
                                fontWeight: 900,
                                lineHeight: 1.2,
                                color: 'navy.main',
                                '.dark &': { color: 'white' }
                            }}>
                                {request.requester_name}
                            </Typography>
                            {request.requester_rating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(16, 185, 129, 0.1)', px: 0.8, py: 0.2, borderRadius: '6px' }}>
                                    <StarIcon sx={{ fontSize: 10, color: '#10B981', mr: 0.3 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#065f46', fontSize: '9px', '.dark &': { color: '#34d399' } }}>
                                        {request.requester_rating.toFixed(1)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="caption" sx={{
                            color: request.status === 'accepted' ? '#065f46' : request.status === 'rejected' ? '#991b1b' : '#475569',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            fontSize: '9px',
                            letterSpacing: '0.05em',
                            '.dark &': { color: request.status === 'accepted' ? '#34d399' : request.status === 'rejected' ? '#f87171' : 'slate.500' }
                        }}>
                            {request.status}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {request.status === 'pending' ? (
                        <>
                            <Tooltip title="Decline">
                                <IconButton
                                    onClick={() => onAction(request.id, 'rejected')}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        '&:hover': { bgcolor: '#ef4444', color: 'white' }
                                    }}
                                >
                                    <RejectIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Accept">
                                <IconButton
                                    onClick={() => onAction(request.id, 'accepted')}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                                        color: '#22c55e',
                                        '&:hover': { bgcolor: '#22c55e', color: 'white' }
                                    }}
                                >
                                    <AcceptIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                            <Box sx={{
                                width: 6,
                                height: 6,
                                borderRadius: 'full',
                                bgcolor: request.status === 'accepted' ? '#22c55e' : '#ef4444'
                            }} />
                            <Typography variant="caption" sx={{
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '9px',
                                color: request.status === 'accepted' ? '#064e3b' : '#991b1b',
                                '.dark &': { color: request.status === 'accepted' ? '#10b981' : '#ef4444' }
                            }}>
                                {request.status === 'accepted' ? 'Added' : 'Declined'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {request.message && (
                <Box sx={{
                    mt: 0.5,
                    p: 1.5,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '1rem',
                    border: '1px dashed rgba(0,0,0,0.05)',
                    '.dark &': {
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.05)'
                    }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <MessageIcon sx={{ fontSize: 12, opacity: 0.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, fontSize: '8px' }}>
                            Join Message
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'slate.600',
                        '.dark &': { color: 'slate.400' },
                        fontStyle: 'italic'
                    }}>
                        "{request.message}"
                    </Typography>
                </Box>
            )}

            {request.requester_audio_url && (
                <Box sx={{
                    p: 1.5,
                    borderRadius: '1rem',
                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                    '.dark &': { bgcolor: 'rgba(16, 185, 129, 0.08)' },
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: isPlaying ? '#ef4444' : '#10B981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: isPlaying ? '#dc2626' : '#059669', transform: 'scale(1.05)' },
                            transition: 'all 0.2s'
                        }} onClick={togglePlay}>
                            {isPlaying ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayIcon sx={{ fontSize: 18 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#065f46', '.dark &': { color: '#34d399' }, display: 'block', fontSize: '8px' }}>
                                Voice Greeting
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 12 }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                                    <Box key={i} sx={{
                                        width: 3,
                                        height: isPlaying ? Math.random() * 10 + 2 : 4,
                                        bgcolor: '#10B981',
                                        borderRadius: 1,
                                        opacity: isPlaying ? 1 : 0.5,
                                        transition: 'height 0.2s',
                                        animation: isPlaying ? `wave 0.5s infinite ease-in-out ${i * 0.05}s` : 'none',
                                        '@keyframes wave': {
                                            '0%, 100%': { height: 4 },
                                            '50%': { height: 12 }
                                        }
                                    }} />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                    <audio
                        ref={audioRef}
                        src={request.requester_audio_url}
                        style={{ display: 'none' }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', fontSize: '10px' }}>
                        Audio
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

interface RequestManagerProps {
    journeyId: string;
}

export function RequestManager({ journeyId }: RequestManagerProps) {
    const { getRequests, updateRequestStatus } = useMessages();
    const { supabase } = useMessages() as any;
    const [requests, setRequests] = useState<JourneyRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        setLoading(true);
        const data = await getRequests(journeyId);
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();

        if (supabase) {
            const channel = supabase
                .channel(`journey_requests_mgr_${journeyId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'journey_requests',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    (payload: any) => {
                        setRequests(prev => [payload.new as JourneyRequest, ...prev]);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'journey_requests',
                        filter: `journey_id=eq.${journeyId}`,
                    },
                    (payload: any) => {
                        setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as JourneyRequest : r));
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [journeyId, supabase]);

    const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
        await updateRequestStatus(requestId, status);
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} color="inherit" sx={{ opacity: 0.3 }} />
            </Box>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');

    if (requests.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                <EmptyIcon sx={{ fontSize: 40, mb: 1, color: 'slate.400' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>No requests yet.</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>Other travelers can request to pair with you here.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                <GroupIcon sx={{ color: '#059669', fontSize: 20 }} />
                <Typography variant="subtitle2" component="h2" sx={{
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'slate.600',
                    fontSize: '11px',
                    '.dark &': { color: 'slate.400' }
                }}>
                    Pairing Requests ({pendingRequests.length})
                </Typography>
            </Box>

            <Stack spacing={2}>
                {requests.map((request) => (
                    <RequestCard key={request.id} request={request} onAction={handleAction} />
                ))}
            </Stack>
        </Box>
    );
}
