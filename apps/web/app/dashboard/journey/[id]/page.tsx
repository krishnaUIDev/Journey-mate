'use client';

import { use, useEffect, useState } from 'react';
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
    ChatBubbleOutlined as ChatIcon
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
    'LHR': [51.4700, -0.4543],
    'JFK': [40.6413, -73.7781],
    'DEL': [28.5562, 77.1000],
    'BOM': [19.0896, 72.8656],
    'DXB': [25.2532, 55.3657],
    'SIN': [1.3644, 103.9915],
    'SFO': [37.6213, -122.3790],
    'SYD': [-33.9399, 151.1753],
    'CDG': [49.0097, 2.5479],
    'HND': [35.5494, 139.7798],
};

function getCoords(name: string): [number, number] {
    const code = name.match(/\((.*?)\)/)?.[1] || name;
    return airportCoords[code] || [20, 0]; // Fallback to center
}

export default function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { journeys } = useJourneys();
    const [journey, setJourney] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const { user } = useUser();
    const { checkRequestStatus, sendRequest } = useMessages();
    const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'rejected' | 'none'>('none');
    const [requestLoading, setRequestLoading] = useState(true);

    const isOwner = user?.id === journey?.userId;

    useEffect(() => {
        const found = journeys.find((j: any) => j.id === id);
        if (found) {
            setJourney(found);
            // Simulate loading delay for smooth transition
            setTimeout(() => setMapLoaded(true), 500);

            // Check request status if not owner
            if (user?.id && user.id !== found.userId) {
                checkRequestStatus(id).then(status => {
                    setRequestStatus(status);
                    setRequestLoading(false);
                });
            } else {
                setRequestLoading(false);
            }
        }
    }, [id, journeys, user?.id, checkRequestStatus]);

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
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white dark:border-slate-800 inline-flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase">FLIGHT</span>
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
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
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
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

                        <div className="flex flex-col gap-6">
                            {/* User Profile Section */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg bg-white dark:bg-slate-700">
                                            <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-sky-500 p-1.5 rounded-xl border-4 border-white dark:border-slate-800 shadow-sm">
                                            <VerifiedIcon sx={{ color: 'white', fontSize: 14 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{journey.user.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verified Member</span>
                                            <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-lg text-[10px] font-black">★ {journey.user.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<WhatsAppIcon />}
                                        sx={{ bgcolor: '#22c55e', color: 'white', borderRadius: '1.2rem', py: 2, fontWeight: 900, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#16a34a' } }}
                                    >
                                        WhatsApp
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<MailIcon />}
                                        sx={{
                                            color: '#1e293b',
                                            borderColor: '#e2e8f0',
                                            borderRadius: '1.2rem',
                                            py: 2,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                                            '@media (prefers-color-scheme: dark)': {
                                                color: '#f8fafc',
                                                borderColor: '#334155',
                                                '&:hover': { bgcolor: '#1e293b', borderColor: '#475569' }
                                            }
                                        }}
                                    >
                                        Email
                                    </Button>

                                    <Divider sx={{ my: 1, opacity: 0.5 }} />

                                    {requestLoading ? (
                                        <Box sx={{ py: 2, textAlign: 'center' }}>
                                            <CircularProgress size={20} />
                                        </Box>
                                    ) : isOwner ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => setChatOpen(true)}
                                                startIcon={<ChatIcon />}
                                                sx={{
                                                    bgcolor: 'navy',
                                                    color: 'white',
                                                    borderRadius: '1.2rem',
                                                    py: 2,
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
                                                    '&:hover': { bgcolor: 'black', scale: 1.02 },
                                                    '.dark &': { bgcolor: 'sand', color: 'navy', '&:hover': { bgcolor: '#fde68a' } }
                                                }}
                                            >
                                                Open Group Chat
                                            </Button>

                                            <Divider sx={{ my: 1, opacity: 0.3 }} />
                                            <RequestManager journeyId={id} />
                                        </Box>
                                    ) : requestStatus === 'accepted' ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => setChatOpen(true)}
                                            startIcon={<ChatIcon />}
                                            sx={{
                                                bgcolor: 'navy',
                                                color: 'white',
                                                borderRadius: '1.2rem',
                                                py: 2,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
                                                '&:hover': { bgcolor: 'black', scale: 1.02 },
                                                '.dark &': { bgcolor: 'sand', color: 'navy', '&:hover': { bgcolor: '#fde68a' } }
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
                                                borderRadius: '1.2rem',
                                                py: 2,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                opacity: 0.7
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
                                                borderRadius: '1.2rem',
                                                py: 2,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '1rem'
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
                                                borderRadius: '1.2rem',
                                                py: 2,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)',
                                                '&:hover': { bgcolor: 'navy', scale: 1.02 },
                                                '.dark &': { bgcolor: 'forest', color: 'white', '&:hover': { bgcolor: '#166534' } }
                                            }}
                                        >
                                            Request to Pair
                                        </Button>
                                    )}
                                </div>
                            </div>

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
