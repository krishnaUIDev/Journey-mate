"use client";

import React from 'react';
import { Box, Typography, Stack, Avatar, Divider } from '@mui/material';
import {
    FlightTakeoff as FlightIcon,
    CalendarToday as DateIcon,
    AirplaneTicket as TicketIcon,
    QrCode as QrIcon,
    MoreHoriz as DotIcon
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

interface BoardingPassTicketProps {
    origin: string;
    destination: string;
    airline: string;
    flightNumber: string;
    date: Dayjs | null;
    passengerName: string;
    passengerAvatar?: string;
}

export function BoardingPassTicket({
    origin,
    destination,
    airline,
    flightNumber,
    date,
    passengerName,
    passengerAvatar
}: BoardingPassTicketProps) {
    // Utility to extract airport code (e.g. "Hyderabad (HYD)" -> "HYD")
    const getCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : (str.slice(0, 3).toUpperCase() || '---');
    };

    const originCode = getCode(origin);
    const destCode = getCode(destination);
    const formattedDate = date ? date.format('DD MMM YYYY') : 'DATE NOT SET';

    return (
        <Box sx={{
            width: '100%',
            maxWidth: 800,
            mx: 'auto',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
            perspective: '1000px',
            '&:hover': {
                '& .ticket-container': {
                    transform: 'rotateX(2deg) translateY(-5px)',
                }
            }
        }}>
            <Box
                className="ticket-container"
                sx={{
                    bgcolor: 'white',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '.dark &': { bgcolor: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                {/* Main Ticket Section */}
                <Box sx={{ flex: 3.5, p: 4, position: 'relative' }}>
                    {/* Header */}
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                bgcolor: '#3B82F6',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                            }}>
                                <FlightIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate.400', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Official Boarding Pass
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'slate.900', lineHeight: 1, '.dark &': { color: 'white' } }}>
                                    {airline || 'Select Airline'}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack sx={{ alignItems: 'flex-end' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#3B82F6', fontFamily: 'monospace' }}>
                                {flightNumber || 'FLIGHT'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400' }}>
                                ECONOMY CLASS
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Flight Path */}
                    <Box sx={{ position: 'relative', mb: 6, py: 2 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: 'slate.900', letterSpacing: '-0.02em', '.dark &': { color: 'white' } }}>
                                    {originCode}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'slate.500', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {origin.split(' (')[0] || 'Origin'}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, px: 3, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{
                                    width: '100%',
                                    height: '2px',
                                    borderBottom: '2px dashed rgba(0,0,0,0.1)',
                                    position: 'absolute',
                                    top: '50%',
                                    '.dark &': { borderBottomColor: 'rgba(255,255,255,0.1)' }
                                }} />
                                <FlightIcon sx={{
                                    color: '#3B82F6',
                                    transform: 'rotate(90deg)',
                                    fontSize: 32,
                                    zIndex: 2,
                                    bgcolor: 'white',
                                    p: 0.5,
                                    '.dark &': { bgcolor: '#18181b' }
                                }} />
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: 'slate.900', letterSpacing: '-0.02em', '.dark &': { color: 'white' } }}>
                                    {destCode}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'slate.500', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {destination.split(' (')[0] || 'Destination'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Passenger & Date info */}
                    <Stack direction="row" spacing={6}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.400', display: 'block', mb: 1 }}>
                                PASSENGER
                            </Typography>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <Avatar src={passengerAvatar} sx={{ width: 32, height: 32, borderRadius: '8px' }} />
                                <Typography sx={{ fontWeight: 900, color: 'slate.900', fontSize: '0.9rem', '.dark &': { color: 'white' } }}>
                                    {passengerName.toUpperCase()}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.400', display: 'block', mb: 1 }}>
                                DATE
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <DateIcon sx={{ fontSize: 16, color: 'slate.400' }} />
                                <Typography sx={{ fontWeight: 900, color: 'slate.900', fontSize: '0.9rem', '.dark &': { color: 'white' } }}>
                                    {formattedDate.toUpperCase()}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.400', display: 'block', mb: 1 }}>
                                SEAT
                            </Typography>
                            <Typography sx={{ fontWeight: 900, color: 'slate.900', fontSize: '0.9rem', '.dark &': { color: 'white' } }}>
                                12A
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Perforation Line */}
                <Box sx={{
                    width: '3px',
                    borderLeft: '4px dashed rgba(0,0,0,0.05)',
                    position: 'relative',
                    my: 4,
                    display: { xs: 'none', md: 'block' },
                    '.dark &': { borderLeftColor: 'rgba(255,255,255,0.05)' }
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -15,
                        left: -15,
                        width: 30,
                        height: 30,
                        bgcolor: 'offwhite',
                        borderRadius: '50%',
                        '.dark &': { bgcolor: '#020617' }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: -15,
                        left: -15,
                        width: 30,
                        height: 30,
                        bgcolor: 'offwhite',
                        borderRadius: '50%',
                        '.dark &': { bgcolor: '#020617' }
                    }} />
                </Box>

                {/* Receipt Section */}
                <Box sx={{
                    flex: 1.5,
                    p: 4,
                    bgcolor: 'rgba(59, 130, 246, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: { md: '1px solid rgba(0,0,0,0.02)' },
                    '.dark &': { bgcolor: 'rgba(59, 130, 246, 0.01)', borderLeftColor: 'rgba(255,255,255,0.02)' }
                }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                        mb: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        '.dark &': { bgcolor: '#27272a' },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-100%',
                            left: 0,
                            right: 0,
                            height: '20%',
                            background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.4), transparent)',
                            animation: 'scanner 3s infinite linear',
                        },
                        '@keyframes scanner': {
                            '0%': { top: '-100%' },
                            '100%': { top: '200%' }
                        }
                    }}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`JOURNEY:${originCode}-${destCode}|${flightNumber}|${formattedDate}`)}&bgcolor=${'ffffff'}`}
                            alt="Boarding Pass QR"
                            style={{ width: 80, height: 80, display: 'block', filter: 'contrast(1.1)' }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate.400', letterSpacing: '0.2em', textAlign: 'center' }}>
                        SCAN FOR<br />VERIFICATION
                    </Typography>
                    <Box sx={{ mt: 'auto', width: '100%' }}>
                        <Divider sx={{ my: 2, opacity: 0.1 }} />
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.400' }}>GATE</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate.900', '.dark &': { color: 'white' } }}>B-32</Typography>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
