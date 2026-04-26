"use client";

import React from 'react';
import { Box, Typography, Avatar, Button, Stack, Paper } from '@mui/material';
import { Verified as VerifiedIcon, Star as KudosIcon } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';

interface AuthorCardProps {
    authorId: string;
    name: string;
    avatar?: string;
    bio?: string;
}

export function AuthorCard({ authorId, name, avatar, bio }: AuthorCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                borderRadius: '2.5rem',
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                '.dark &': {
                    bgcolor: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.05)'
                }
            }}
        >
            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={avatar}
                        alt={name}
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '1.5rem',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                        }}
                    >
                        {name.charAt(0)}
                    </Avatar>
                    <Box sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'blue.500',
                        color: 'white',
                        p: 0.5,
                        borderRadius: '0.5rem',
                        display: 'flex',
                        border: '2px solid white',
                        '.dark &': { borderColor: '#18181b' }
                    }}>
                        <VerifiedIcon sx={{ fontSize: 12 }} />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'slate.900', '.dark &': { color: 'white' } }}>
                            {name}
                        </Typography>
                        <Typography variant="caption" sx={{
                            fontWeight: 900,
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            px: 1,
                            py: 0.2,
                            borderRadius: '0.5rem',
                            fontSize: '0.65rem'
                        }}>
                            AUTHOR
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'slate.500', mb: 2, fontWeight: 500, '.dark &': { color: 'slate.400' } }}>
                        {bio || "Passionate traveler sharing insights and stories from across the globe."}
                    </Typography>

                    <Button
                        component={Link}
                        href={`/companions`} // Since there isn't a direct profile page yet, we link to companions search or similar if available
                        variant="outlined"
                        size="small"
                        startIcon={<KudosIcon />}
                        sx={{
                            borderRadius: '1rem',
                            textTransform: 'none',
                            fontWeight: 900,
                            borderColor: 'rgba(0,0,0,0.1)',
                            color: 'slate.700',
                            px: 2,
                            '&:hover': { bgcolor: 'white', borderColor: 'blue.500', color: 'blue.500' },
                            '.dark &': { color: 'slate.300', borderColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        View Traveler Profile
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}
