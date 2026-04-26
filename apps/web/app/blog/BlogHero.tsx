"use client";

import React, { useState } from 'react';
import { Box, Typography, Container, Stack, Button } from '@mui/material';
import { Create as EditIcon } from '@mui/icons-material';
import { AddBlogPostModal } from '../dashboard/components/AddBlogPostModal';
import { useUser } from '@clerk/nextjs';

export function BlogHero() {
    const [modalOpen, setModalOpen] = useState(false);
    const { isSignedIn } = useUser();

    return (
        <Box sx={{
            pt: 4,
            pb: 3,
            bgcolor: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            '.dark &': { bgcolor: '#09090b', borderColor: 'rgba(255,255,255,0.05)' }
        }}>
            <Container maxWidth="xl">
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' } }} spacing={4}>
                    <Stack spacing={2}>
                        <Typography
                            variant="overline"
                            sx={{
                                fontWeight: 900,
                                color: '#3B82F6',
                                letterSpacing: '0.3em',
                                display: 'block'
                            }}
                        >
                            DESTINATION INSIGHTS
                        </Typography>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter max-w-4xl">
                            Travel stories from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">companion community.</span>
                        </h1>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 500,
                                color: 'slate.500',
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                '.dark &': { color: 'slate.400' }
                            }}
                        >
                            Discovery guides, safety tips, and unforgettable memories shared by travelers like you.
                        </Typography>
                    </Stack>

                    {isSignedIn && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<EditIcon />}
                            onClick={() => setModalOpen(true)}
                            sx={{
                                borderRadius: '0.75rem',
                                px: 2.5,
                                py: 1,
                                fontWeight: 900,
                                textTransform: 'none',
                                variant: 'outlined',
                                border: '1.5px solid rgba(59, 130, 246, 0.4)',
                                color: '#3B82F6',
                                bgcolor: 'transparent',
                                fontSize: '0.8rem',
                                letterSpacing: '0.04em',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: 'rgba(59, 130, 246, 0.05)',
                                    borderColor: '#3B82F6',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                                },
                                '.dark &': {
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' }
                                }
                            }}
                        >
                            Write Your Story
                        </Button>
                    )}
                </Stack>
            </Container>

            <AddBlogPostModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </Box>
    );
}
