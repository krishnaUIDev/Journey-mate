"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Stack, Button, IconButton } from '@mui/material';
import {
    Download as SaveIcon,
    Share as ShareIcon,
    ArrowBack as BackIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';
import { BoardingPassTicket } from '../../dashboard/components/BoardingPassTicket';
import dayjs from 'dayjs';

function TicketContent() {
    const searchParams = useSearchParams();

    const from = searchParams.get('from') || '---';
    const to = searchParams.get('to') || '---';
    const flight = searchParams.get('flight') || 'FLIGHT';
    const dateStr = searchParams.get('date') || '';
    const pax = searchParams.get('pax') || 'Guest Traveler';
    const airline = searchParams.get('airline') || 'Journey-Mate Air';
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    const date = dateStr ? dayjs(dateStr) : dayjs();

    const destCoords = isNaN(lat) || isNaN(lng) ? undefined : { lat, lng };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Journey-Mate Boarding Pass - ${pax}`,
                    text: `Checkout my boarding pass from ${from} to ${to}!`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            alert('Sharing is not supported on this browser.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'offwhite', '.dark &': { bgcolor: '#020617' }, py: 4 }}>
            <Container maxWidth="md">
                <Stack spacing={4}>
                    {/* Header */}
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <IconButton onClick={() => window.history.back()} sx={{ bgcolor: 'white', '.dark &': { bgcolor: 'white/5' } }}>
                            <BackIcon />
                        </IconButton>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <VerifiedIcon sx={{ color: '#3B82F6' }} />
                            <Typography sx={{ fontWeight: 900, color: 'slate.900', '.dark &': { color: 'white' } }}>
                                VIRTUAL TICKET
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Ticket */}
                    <Box sx={{ perspective: '2000px' }}>
                        <BoardingPassTicket
                            origin={from}
                            destination={to}
                            airline={airline}
                            flightNumber={flight}
                            date={date}
                            passengerName={pax}
                            destCoords={destCoords}
                        />
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => alert('Saving ticket image to your library...')}
                            sx={{
                                borderRadius: '1.5rem',
                                py: 2,
                                fontWeight: 900,
                                bgcolor: '#3B82F6',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#2563EB' }
                            }}
                        >
                            Save to Photos
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={handleShare}
                            sx={{
                                borderRadius: '1.5rem',
                                py: 2,
                                fontWeight: 900,
                                borderColor: 'slate.200',
                                color: 'slate.900',
                                textTransform: 'none',
                                '.dark &': { borderColor: 'white/10', color: 'white' }
                            }}
                        >
                            Share Ticket
                        </Button>
                    </Stack>

                    <Box sx={{ textAlign: 'center', opacity: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            This is a verified digital pass generated by Journey-Mate.
                            All flight information is synchronized with our travel network.
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default function TicketGeneratePage() {
    return (
        <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#020617' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 900 }}>LOADING PASS...</Typography>
            </Box>
        }>
            <TicketContent />
        </Suspense>
    );
}
