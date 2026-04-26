"use client";

import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Stack,
    Rating,
    Chip
} from '@mui/material';
import {
    Star as KudosIcon,
    SentimentVerySatisfied as PositiveIcon,
    SentimentNeutral as NeutralIcon,
    SentimentVeryDissatisfied as NegativeIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BADGE_MAP: Record<string, { label: string; icon: string; color: string }> = {
    'expert_navigator': { label: 'Expert Navigator', icon: '🧭', color: '#3b82f6' },
    'great_storyteller': { label: 'Great Storyteller', icon: '📖', color: '#a855f7' },
    'helpful_luggage': { label: 'Helpful with Luggage', icon: '🧳', color: '#f59e0b' },
    'punctual': { label: 'Punctual', icon: '⏰', color: '#10b981' },
    'safe_traveler': { label: 'Safe Traveler', icon: '🛡️', color: '#ef4444' }
};

interface Kudos {
    id: string;
    reviewer_id: string;
    content: string;
    type: 'positive' | 'neutral' | 'negative';
    badges?: string[];
    created_at: string;
}

interface KudosCabinetProps {
    reviews: Kudos[];
    userName: string;
}

export function KudosCabinet({ reviews, userName }: KudosCabinetProps) {
    if (reviews.length === 0) return null;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'slate.500', letterSpacing: '0.1em' }}>
                TRUST FEEDBACK — {userName.toUpperCase()}
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
                {reviews.map((kudo) => (
                    <Paper
                        key={kudo.id}
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: '1.5rem',
                            bgcolor: 'white',
                            border: '1px solid rgba(0,0,0,0.03)',
                            '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' },
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.02)' }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {kudo.type === 'positive' ? (
                                    <PositiveIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                ) : kudo.type === 'neutral' ? (
                                    <NeutralIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                                ) : (
                                    <NegativeIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                )}
                                <Typography sx={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    color: kudo.type === 'positive' ? '#059669' : kudo.type === 'neutral' ? '#d97706' : '#dc2626',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {kudo.type === 'positive' ? 'Great Companion' : kudo.type === 'neutral' ? 'OK Experience' : 'Tough Journey'}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '10px', color: 'slate.400', fontWeight: 600 }}>
                                {dayjs(kudo.created_at).fromNow()}
                            </Typography>
                        </Box>
                        <Typography sx={{
                            fontSize: '0.85rem',
                            color: 'navy.main',
                            '.dark &': { color: 'slate.300' },
                            lineHeight: 1.5,
                            fontWeight: 600,
                            fontStyle: 'italic'
                        }}>
                            "{kudo.content}"
                        </Typography>

                        {kudo.badges && kudo.badges.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {kudo.badges.map((badgeId) => {
                                    const badge = BADGE_MAP[badgeId];
                                    if (!badge) return null;
                                    return (
                                        <Box
                                            key={badgeId}
                                            sx={{
                                                px: 1.2,
                                                py: 0.5,
                                                borderRadius: '0.75rem',
                                                fontSize: '9px',
                                                fontWeight: 900,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                bgcolor: `${badge.color}15`,
                                                color: badge.color,
                                                border: `1px solid ${badge.color}30`,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.02em'
                                            }}
                                        >
                                            <span>{badge.icon}</span>
                                            {badge.label}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
