'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useJourneys } from "../../../../context/JourneysContext";
import dynamic from 'next/dynamic';
import {
    Button,
    IconButton,
    Typography,
    Divider,
    Box,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Share as ShareIcon,
    WhatsApp as WhatsAppIcon,
    Email as MailIcon,
    Verified as VerifiedIcon,
    ChatBubbleOutlined as ChatIcon,
    Instagram as InstagramIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useUser } from '@clerk/nextjs';
import { ChatWindow } from '../../components/ChatWindow';
import { RequestManager } from '../../components/RequestManager';
import { Drawer } from '@mui/material';
import { useMessages } from '../../../../context/MessagesContext';

const JourneyMap = dynamic(() => import("../../components/JourneyMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/20 animate-pulse" />
});

// Simple coordinate lookup for demo
const airportCoords: Record<string, [number, number]> = {
    // Global Hubs
    'LHR': [51.4700, -0.4543],
    'JFK': [40.6413, -73.7781],
    'DXB': [25.2532, 55.3657],
    'SIN': [1.3644, 103.9915],
    'SFO': [37.6213, -122.3790],
    'SYD': [-33.9399, 151.1753],
    'CDG': [49.0097, 2.5479],
    'HND': [35.5494, 139.7798],
    'FRA': [50.0379, 8.5622],
    'AMS': [52.3105, 4.7683],
    'YYZ': [43.6777, -79.6248],
    'LAX': [33.9416, -118.4085],
    'EWR': [40.6895, -74.1745],
    'LGA': [40.7769, -73.8740],
    'JAX': [30.4941, -81.6879],
    'DOH': [25.2731, 51.6081],

    // India Hubs
    'DEL': [28.5562, 77.1000],
    'BOM': [19.0896, 72.8656],
    'MAA': [12.9941, 80.1709],
    'BLR': [13.1986, 77.7066],
    'HYD': [17.2403, 78.4294],
    'CCU': [22.6547, 88.4467],
    'PNQ': [18.5826, 73.9197],
    'AMD': [23.0734, 72.6347],
    'COK': [10.1520, 76.3920],
    'TRV': [8.4821, 76.9200],
};

const getCoords = (name: string): [number, number] => {
    const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]; // Center of US
    if (!name) return DEFAULT_CENTER;

    // 1. Try to extract IATA code from parentheses like "Jacksonville (JAX)"
    const codeMatch = name.match(/\(([A-Z]{3})\)/);
    if (codeMatch && airportCoords[codeMatch[1]]) {
        return airportCoords[codeMatch[1]] as [number, number];
    }

    // 2. Try direct lookup (case insensitive)
    const upperName = name.toUpperCase().trim();
    if (airportCoords[upperName]) return airportCoords[upperName] as [number, number];

    // 3. Fallback common names
    if (upperName.includes('NEW YORK')) return airportCoords['JFK'] as [number, number];
    if (upperName.includes('JACKSONVILLE')) return airportCoords['JAX'] as [number, number];
    if (upperName.includes('CHENNAI')) return airportCoords['MAA'] as [number, number];
    if (upperName.includes('DELHI')) return airportCoords['DEL'] as [number, number];
    if (upperName.includes('MUMBAI')) return airportCoords['BOM'] as [number, number];
    if (upperName.includes('BANGALORE')) return airportCoords['BLR'] as [number, number];
    if (upperName.includes('HYDERABAD')) return airportCoords['HYD'] as [number, number];

    // 4. Final attempt with cleaned name
    const cleaned = upperName.replace(/[^A-Z]/g, '');
    if (airportCoords[cleaned]) return airportCoords[cleaned] as [number, number];

    // 5. Default to center of US
    return DEFAULT_CENTER;
}

export default function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { journeys } = useJourneys();
    const [journey, setJourney] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const { user } = useUser();
    const { checkRequestStatus, sendRequest, showNotification, setActiveJourneyId } = useMessages();
    const { supabase } = useMessages() as any; // Access supabase for extra subscription if needed, or better, use subscribeToRequests
    const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'rejected' | 'none'>('none');
    const [requestLoading, setRequestLoading] = useState(true);

    const isOwner = user?.id === journey?.userId;
    const isPastTrip = journey?.date && dayjs(journey.date).isBefore(dayjs(), 'day');

    // Notification suppression logic
    useEffect(() => {
        setActiveJourneyId(id);
        return () => setActiveJourneyId(null);
    }, [id, setActiveJourneyId]);

    useEffect(() => {
        const found = journeys.find((j: any) => j.id === id);
        if (found) {
            setJourney(found);
            setTimeout(() => setMapLoaded(true), 500);

            // Initial status check
            // Past trips are exempt from gating
            if (user?.id && user.id !== found.userId && !isPastTrip) {
                checkRequestStatus(id).then(status => {
                    setRequestStatus(status);
                    setRequestLoading(false);
                });

                // Real-time status subscription
                if (supabase) {
                    const channel = supabase
                        .channel(`request_status_${id}_${user.id}`)
                        .on(
                            'postgres_changes',
                            {
                                event: 'UPDATE',
                                schema: 'public',
                                table: 'journey_requests',
                                filter: `journey_id=eq.${id} AND requester_id=eq.${user.id}`,
                            },
                            (payload: any) => {
                                const newStatus = payload.new.status;
                                setRequestStatus(newStatus);
                                if (newStatus === 'accepted') {
                                    showNotification("Request accepted! You can now join the discussion.", 'success');
                                } else if (newStatus === 'rejected') {
                                    showNotification("Your request to pair was declined.", 'info');
                                }
                            }
                        )
                        .subscribe();

                    return () => {
                        supabase.removeChannel(channel);
                    };
                }
            } else if (isPastTrip || (user?.id && user.id === found.userId)) {
                // If it's a past trip or the owner, they can join.
                setRequestStatus('accepted');
                setRequestLoading(false);
            } else {
                setRequestLoading(false);
            }
        } else {
            setRequestLoading(false);
        }
    }, [id, journeys, user?.id, checkRequestStatus, supabase, isPastTrip, showNotification]);


    const handleShare = async () => {
        const shareData = {
            title: `Journey from ${journey?.from} to ${journey?.to}`,
            text: `Check out this journey on Journey-Mate! ${journey?.description}`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                showNotification('Shared successfully!', 'success');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showNotification('Link copied to clipboard!', 'success');
            } catch (err) {
                showNotification('Failed to copy link.', 'error');
            }
        }
    };

    const handleRequestAction = async () => {
        await sendRequest(id);
        const newStatus = await checkRequestStatus(id);
        setRequestStatus(newStatus);
    };

    if (!journey) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <Typography variant="h6" className="font-black opacity-50 uppercase tracking-widest">Initializing...</Typography>
                </div>
            </div>
        );
    }

    const originCoords = getCoords(journey.from);
    const destCoords = getCoords(journey.to);

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-inter">
            {/* 1. Fixed Background Map Layer */}
            <div className="fixed inset-0 z-0 h-screen w-screen">
                <div className={`w-full h-full transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <JourneyMap
                        center={[(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2]}
                        zoom={3}
                        markers={[
                            { position: originCoords, label: journey.from, type: 'origin' },
                            { position: destCoords, label: journey.to, type: 'destination' }
                        ]}
                        route={[originCoords, destCoords]}
                        isAnimated={true}
                    />
                </div>

                {/* Subtle vignette for edge focus */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_150px_rgba(0,0,0,0.3)]" />
            </div>

            {/* 2. Top Navigation - Adjusted to avoid dashboard nav overlap */}
            <header className="fixed top-[72px] left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <IconButton
                    onClick={() => router.back()}
                    className="pointer-events-auto"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        '&:hover': { bgcolor: 'white', scale: 1.05 },
                        '@media (prefers-color-scheme: dark)': {
                            bgcolor: 'rgba(30,41,59,0.9)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: '#1e293b' }
                        }
                    }}
                >
                    <BackIcon sx={{ color: '#1e293b', '@media (prefers-color-scheme: dark)': { color: '#f8fafc' } }} />
                </IconButton>
                <div className="flex gap-4 pointer-events-auto">
                    <Button
                        variant="contained"
                        onClick={handleShare}
                        startIcon={<ShareIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#1e293b',
                            borderRadius: '1rem',
                            px: 3,
                            py: 1,
                            fontWeight: 800,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            '&:hover': { bgcolor: '#f8fafc' },
                            '@media (prefers-color-scheme: dark)': {
                                bgcolor: '#1e293b',
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: '#334155' }
                            }
                        }}
                    >
                        Share
                    </Button>
                </div>
            </header>

            {/* 3. Content Area */}
            <div className="relative z-10 flex flex-col min-h-screen pointer-events-none lg:block">
                {/* Hero Spacer (Mobile/Tablet only) - Shows the map */}
                <div className="h-[55vh] lg:hidden flex flex-col justify-end p-8 transition-all duration-700">
                    <div className={`transition-all duration-1000 ${mapLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase mb-1">FLIGHT</span>
                                <div className="flex items-center gap-3">
                                    {journey.flightNumber && (
                                        <img
                                            src={`https://www.gstatic.com/flights/airline_logos/70px/${journey.flightNumber.match(/^[A-Z0-9]{2}/)?.[0]}.png`}
                                            alt={journey.flightNumber}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                        />
                                    )}
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Sheet (Bottom on Mobile, Side on Desktop) */}
                <aside className={`
                    bg-white dark:bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-700
                    /* Mobile styles */
                    rounded-t-[3rem] mx-2 -mt-6 pb-24 border-x border-t border-slate-100 dark:border-slate-800 relative z-20
                    /* Desktop Styles */
                    lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-[480px] lg:m-0 lg:rounded-none lg:rounded-l-[3.5rem] lg:pb-12 lg:overflow-y-auto lg:border-t-0 lg:z-[60] lg:mt-0
                    ${mapLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                `}>
                    {/* Visual indicators for different modes */}
                    <div className="lg:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-6" />
                    <div className="hidden lg:block pt-24" />

                    <div className="px-6 lg:px-8">
                        {/* Hero Info - Desktop Version (Visible only on lg) */}
                        <div className="hidden lg:flex items-center gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 inline-flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase">FLIGHT</span>
                                <div className="flex items-center gap-3">
                                    {journey.flightNumber && (
                                        <img
                                            src={`https://www.gstatic.com/flights/airline_logos/70px/${journey.flightNumber.match(/^[A-Z0-9]{2}/)?.[0]}.png`}
                                            alt={journey.flightNumber}
                                            className="w-6 h-6 object-contain"
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                        />
                                    )}
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Info in Sheet */}
                        <div className="flex flex-col mb-8">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {journey.from.split(' (')[0]}
                                </h1>
                                <span className="text-2xl font-bold text-slate-300 dark:text-slate-700">→</span>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {journey.to.split(' (')[0]}
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight mt-2">
                                Scheduled for {dayjs(journey.date).format('dddd, MMMM DD')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* User Profile Section - Cleaner and More Integrated */}
                            <div className="flex items-center gap-6 group">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-800 transition-all group-hover:scale-105">
                                        <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-sky-500 p-1 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm">
                                        <VerifiedIcon sx={{ color: 'white', fontSize: 10 }} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{journey.user.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                            {journey.user.verified ? 'Verified Member' : 'Exploring Member'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-lg text-[9px] font-black">
                                            {journey.user.rating > 0 ? `★ ${journey.user.rating.toFixed(1)}` : 'NEW MEMBER'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Actions Area - Prominent and Clean */}
                            <div className="space-y-4">
                                {requestLoading ? (
                                    <Box sx={{ py: 3, textAlign: 'center' }}>
                                        <CircularProgress size={24} sx={{ color: 'navy', '.dark &': { color: 'sand' } }} />
                                    </Box>
                                ) : (isOwner || isPastTrip) ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => setChatOpen(true)}
                                        startIcon={<ChatIcon />}
                                        sx={{
                                            bgcolor: 'navy',
                                            color: 'white',
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            letterSpacing: '-0.02em',
                                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
                                            '&:hover': { bgcolor: 'black', scale: 1.01 },
                                            '.dark &': { bgcolor: 'sand', color: 'navy', boxShadow: '0 20px 40px -10px rgba(253, 230, 138, 0.2)', '&:hover': { bgcolor: '#fde68a' } }
                                        }}
                                    >
                                        {isPastTrip ? "View Discussion Archive" : "Open Group Chat"}
                                    </Button>
                                ) : requestStatus === 'accepted' ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => setChatOpen(true)}
                                        startIcon={<ChatIcon />}
                                        sx={{
                                            bgcolor: 'navy',
                                            color: 'white',
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            letterSpacing: '-0.02em',
                                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
                                            '&:hover': { bgcolor: 'black', scale: 1.01 },
                                            '.dark &': { bgcolor: 'sand', color: 'navy', boxShadow: '0 20px 40px -10px rgba(253, 230, 138, 0.2)', '&:hover': { bgcolor: '#fde68a' } }
                                        }}
                                    >
                                        Join Discussion
                                    </Button>
                                ) : requestStatus === 'pending' ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled
                                        sx={{
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            opacity: 0.6,
                                            borderWidth: '2px !important',
                                            borderColor: 'slate.200 !important'
                                        }}
                                    >
                                        Request Sent (Pending)
                                    </Button>
                                ) : requestStatus === 'rejected' ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled
                                        color="error"
                                        sx={{
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            borderWidth: '2px !important'
                                        }}
                                    >
                                        Request Declined
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleRequestAction}
                                        startIcon={<ChatIcon />}
                                        sx={{
                                            bgcolor: 'forest',
                                            color: 'white',
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            letterSpacing: '-0.02em',
                                            boxShadow: '0 20px 40px -10px rgba(34, 197, 94, 0.3)',
                                            '&:hover': { bgcolor: 'navy', scale: 1.01 },
                                            '.dark &': { bgcolor: 'forest', color: 'white', '&:hover': { bgcolor: '#166534' } }
                                        }}
                                    >
                                        Request to Pair
                                    </Button>
                                )}

                                {isOwner && !isPastTrip && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <RequestManager journeyId={id} />
                                    </div>
                                )}
                            </div>

                            {/* Secondary Actions / Connect Section - More Compact */}
                            {journey.contactInfo && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700">
                                    <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">CONNECT WITH OWNER</h5>
                                    <div className="flex flex-col gap-3">
                                        {/* Detect if contact info is email, Instagram or phone */}
                                        {journey.contactInfo.includes('@') && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<MailIcon sx={{ fontSize: 18 }} />}
                                                onClick={() => window.open(`mailto:${journey.contactInfo}`, '_blank')}
                                                sx={{
                                                    bgcolor: 'white',
                                                    color: '#1e293b',
                                                    borderRadius: '1rem',
                                                    py: 1.5,
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                    border: '1px solid',
                                                    borderColor: 'slate.200',
                                                    '&:hover': { bgcolor: '#f8fafc', borderColor: 'slate.300', scale: 1.02 },
                                                    '.dark &': {
                                                        bgcolor: 'white/10',
                                                        color: 'white',
                                                        borderColor: 'white/10',
                                                        '&:hover': { bgcolor: 'white/20', borderColor: 'white/20' }
                                                    }
                                                }}
                                            >
                                                Send Email
                                            </Button>
                                        )}

                                        {/* Instagram Check: if starts with @ or seems like a username (no dots, no spaces, no @ in middle) */}
                                        {(journey.contactInfo.startsWith('@') || (!journey.contactInfo.includes('@') && !/^\d+$/.test(journey.contactInfo.replace(/[\s\-\+]/g, '')) && journey.contactInfo.length > 2)) && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<InstagramIcon sx={{ fontSize: 18 }} />}
                                                onClick={() => window.open(`https://instagram.com/${journey.contactInfo.replace('@', '')}`, '_blank')}
                                                sx={{
                                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                                    color: 'white',
                                                    borderRadius: '1rem',
                                                    py: 1.5,
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 4px 12px rgba(220, 39, 67, 0.2)',
                                                    '&:hover': { opacity: 0.9, scale: 1.02 }
                                                }}
                                            >
                                                Instagram DM
                                            </Button>
                                        )}

                                        {(/^\d+$/.test(journey.contactInfo.replace(/[\s\-\+]/g, '')) && journey.contactInfo.length > 5) && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<WhatsAppIcon sx={{ fontSize: 18 }} />}
                                                onClick={() => window.open(`https://wa.me/${journey.contactInfo.replace(/[^0-9]/g, '')}`, '_blank')}
                                                sx={{
                                                    bgcolor: '#22c55e',
                                                    color: 'white',
                                                    borderRadius: '1rem',
                                                    py: 1.5,
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                                    '&:hover': { bgcolor: '#16a34a', scale: 1.02 }
                                                }}
                                            >
                                                WhatsApp Chat
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Details Section */}
                            <div className="space-y-6">
                                <div className="p-6 bg-sky-50/50 dark:bg-sky-900/10 rounded-[2.5rem] border border-sky-100/50 dark:border-sky-800/30">
                                    <h5 className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em] mb-4">MATCH NOTES</h5>
                                    <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                        "{journey.description}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Chat Drawer */}
            <Drawer
                anchor="right"
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: '100%', sm: 400 },
                            bgcolor: 'transparent',
                            boxShadow: 'none',
                            border: 'none'
                        }
                    }
                }}
            >
                <Box sx={{ height: '100%', p: { xs: 0, sm: 2 } }}>
                    <ChatWindow journeyId={id} onClose={() => setChatOpen(false)} />
                </Box>
            </Drawer>
        </div>
    );
}
