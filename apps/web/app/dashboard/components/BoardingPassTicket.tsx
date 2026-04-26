"use client";

import React from 'react';
import { Box, Typography, Stack, Avatar, Divider, CircularProgress } from '@mui/material';
import {
    FlightTakeoff as FlightIcon,
    CalendarToday as DateIcon,
    AirplaneTicket as TicketIcon,
    QrCode as QrIcon,
    MoreHoriz as DotIcon,
    WbSunny as SunnyIcon,
    Cloud as CloudyIcon,
    WbCloudy as ParticlCloudyIcon,
    BeachAccess as RainIcon
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
    passengerAvatar,
    destCoords
}: BoardingPassTicketProps & { destCoords?: { lat: number, lng: number } }) {
    // State for real-time weather
    const [weatherData, setWeatherData] = React.useState<{ icon: React.ReactNode, temp: string, desc: string } | null>(null);
    const [loadingWeather, setLoadingWeather] = React.useState(false);

    // Dynamic Weather Fetching (Open-Meteo)
    React.useEffect(() => {
        if (!destCoords?.lat || !destCoords?.lng) {
            setWeatherData(null);
            return;
        }

        const fetchWeather = async () => {
            setLoadingWeather(true);
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destCoords.lat}&longitude=${destCoords.lng}&current_weather=true`);
                const data = await res.json();

                if (data.current_weather) {
                    const code = data.current_weather.weathercode;
                    let icon = <SunnyIcon sx={{ color: '#FBBF24' }} />;
                    let desc = 'CLEAR';

                    if (code >= 1 && code <= 3) { icon = <ParticlCloudyIcon sx={{ color: '#94A3B8' }} />; desc = 'OVERCAST'; }
                    else if (code >= 51 && code <= 67) { icon = <RainIcon sx={{ color: '#60A5FA' }} />; desc = 'RAINING'; }
                    else if (code >= 80) { icon = <RainIcon sx={{ color: '#60A5FA' }} />; desc = 'SHOWERS'; }
                    else if (code >= 45) { icon = <CloudyIcon sx={{ color: '#94A3B8' }} />; desc = 'FOGGY'; }

                    setWeatherData({
                        icon,
                        temp: `${Math.round(data.current_weather.temperature)}°C`,
                        desc
                    });
                }
            } catch (err) {
                console.error("Weather fetch failed:", err);
            } finally {
                setLoadingWeather(false);
            }
        };

        fetchWeather();
    }, [destCoords]);

    // Utility to extract airport code (e.g. "Hyderabad (HYD)" -> "HYD")
    const getCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : (str.slice(0, 3).toUpperCase() || '---');
    };

    const originCode = getCode(origin);
    const destCode = getCode(destination);
    const formattedDate = date ? date.format('DD MMM YYYY') : 'DATE NOT SET';

    // Hydration-safe state for the full QR URL
    const [qrUrl, setQrUrl] = React.useState<string>("");

    React.useEffect(() => {
        const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://journey-mate.com';
        const data = `${originUrl}/ticket/generate?from=${originCode}&to=${destCode}&flight=${flightNumber}&date=${formattedDate}&pax=${encodeURIComponent(passengerName)}&airline=${encodeURIComponent(airline)}&lat=${destCoords?.lat || ''}&lng=${destCoords?.lng || ''}`;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}&bgcolor=${'ffffff'}`);
    }, [originCode, destCode, flightNumber, formattedDate, passengerName, airline, destCoords]);

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

                    {/* Arrival Pulse (Weather) */}
                    <Box sx={{
                        mb: 6,
                        p: 2,
                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '1.25rem',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: !destCoords ? 0.5 : 1,
                        transition: 'opacity 0.3s'
                    }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '0.75rem', display: 'flex', '.dark &': { bgcolor: 'white/5' } }}>
                                {loadingWeather ? <CircularProgress size={20} thickness={6} /> : (weatherData?.icon || <SunnyIcon sx={{ color: 'slate.200' }} />)}
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate.400', display: 'block', lineHeight: 1, mb: 0.5 }}>
                                    ARRIVAL PULSE
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: 'slate.900', '.dark &': { color: 'white' } }}>
                                    {loadingWeather ? 'FETCHING LIVE DATA...' : (!weatherData ? 'WAITING FOR DESTINATION...' : `${weatherData.desc} — ${weatherData.temp}`)}
                                </Typography>
                            </Box>
                        </Stack>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#3B82F6' }}>
                            {loadingWeather ? 'SYNCING...' : 'LIVE FORECAST'}
                        </Typography>
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
                        {qrUrl ? (
                            <img
                                key={qrUrl}
                                src={qrUrl}
                                alt="Boarding Pass QR"
                                style={{ width: 80, height: 80, display: 'block', filter: 'contrast(1.1)' }}
                            />
                        ) : (
                            <Box sx={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <QrIcon sx={{ fontSize: 40, opacity: 0.1 }} />
                            </Box>
                        )}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate.400', letterSpacing: '0.2em', textAlign: 'center', mb: 3 }}>
                        SCAN FOR<br />WALLET PASS
                    </Typography>

                    {/* Wallet Buttons */}
                    <Stack spacing={1} sx={{ width: '100%' }}>
                        <Box
                            onClick={() => alert("Pass added to Apple Wallet!")}
                            sx={{
                                bgcolor: 'black',
                                borderRadius: '8px',
                                py: 1,
                                px: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { opacity: 0.8, transform: 'scale(0.98)' }
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: 8 }}>
                                <path
                                    fill="white"
                                    d="M19,13H5V9H19V13M5,5H19V7H5V5M19,15H5V19H19V15M21,3H3V21H21V3Z"
                                />
                            </svg>
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '9px' }}>
                                Add to Apple Wallet
                            </Typography>
                        </Box>
                        <Box
                            onClick={() => alert("Pass added to Google Wallet!")}
                            sx={{
                                bgcolor: 'white',
                                border: '1px solid #dadce0',
                                borderRadius: '8px',
                                py: 1,
                                px: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#f8f9fa', transform: 'scale(0.98)' }
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: 8 }}>
                                <path
                                    fill="#4285F4"
                                    d="M20,4H4C2.89,4 2,4.89 2,6V18C2,19.11 2.89,20 4,20H20C21.11,20 22,19.11 22,18V6C22,4.89 21.11,4 20,4M20,18H4V8H20V18M19,10H5V16H19V10"
                                />
                            </svg>
                            <Typography variant="caption" sx={{ color: '#3c4043', fontWeight: 600, fontSize: '9px' }}>
                                Add to Google Wallet
                            </Typography>
                        </Box>
                    </Stack>

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
