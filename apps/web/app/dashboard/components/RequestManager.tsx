"use client";

import React, { useEffect, useState } from "react";
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
    ErrorOutlined as EmptyIcon
} from "@mui/icons-material";
import { useMessages, JourneyRequest } from "../../../context/MessagesContext";

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
        // Only show pending requests initially, or all? Let's show all but highlight pending.
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();

        // Real-time subscription for new requests
        if (supabase) {
            const channel = supabase
                .channel(`journey_requests_${journeyId}`)
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
        // Refresh local state
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
    const acceptedRequests = requests.filter(r => r.status === 'accepted');

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
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                <GroupIcon sx={{ color: 'forest', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'slate.500' }}>
                    Pairing Requests ({pendingRequests.length})
                </Typography>
            </Box>

            <Stack spacing={2}>
                {requests.map((request) => (
                    <Paper
                        key={request.id}
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: '1.5rem',
                            bgcolor: 'rgba(0,0,0,0.02)',
                            '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
                            border: '1px solid rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={request.requester_avatar}
                                sx={{ width: 44, height: 44, borderRadius: '14px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                    {request.requester_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: request.status === 'accepted' ? 'forest' : request.status === 'rejected' ? 'error.main' : 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.05em' }}>
                                    {request.status}
                                </Typography>
                            </Box>
                        </Box>

                        {request.status === 'pending' ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Decline">
                                    <IconButton
                                        onClick={() => handleAction(request.id, 'rejected')}
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
                                        onClick={() => handleAction(request.id, 'accepted')}
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
                            </Box>
                        ) : (
                            <Typography variant="caption" sx={{ opacity: 0.3, fontWeight: 700 }}>
                                Processed
                            </Typography>
                        )}
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
