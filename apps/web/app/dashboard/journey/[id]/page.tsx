'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJourneys } from "../../../../context/JourneysContext";
import dynamic from 'next/dynamic';
import {
    Button,
    IconButton,
    Typography,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Share as ShareIcon,
    WhatsApp as WhatsAppIcon,
    Email as MailIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

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

    useEffect(() => {
        const found = journeys.find((j: any) => j.id === id);
        if (found) {
            setJourney(found);
            // Simulate loading delay for smooth transition
            setTimeout(() => setMapLoaded(true), 500);
        }
    }, [id, journeys]);

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
        <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-inter">
            {/* 1. Fixed Background Map Layer */}
            <div className="fixed inset-0 z-0 h-screen w-screen">
                <div className={`w-full h-full transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <JourneyMap
                        center={[(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2]}
                        zoom={3}
                        markers={[
                            { position: originCoords, label: journey.from },
                            { position: destCoords, label: journey.to }
                        ]}
                        route={[originCoords, destCoords]}
                        isAnimated={true}
                    />
                </div>

                {/* Subtle vignette for edge focus */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]" />
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
                        '&:hover': { bgcolor: 'white', scale: 1.05 }
                    }}
                >
                    <BackIcon sx={{ color: '#1e293b' }} />
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
                            '&:hover': { bgcolor: '#f8fafc' }
                        }}
                    >
                        Share
                    </Button>
                </div>
            </header>

            {/* 3. Scrollable Content Area - pointer-events-none allows dragging map in Hero area */}
            <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
                {/* Hero Spacer - Shows the map */}
                <div className="h-[60vh] flex flex-col justify-end p-8 transition-all duration-700">
                    <div className={`transition-all duration-1000 ${mapLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white inline-flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">FLIGHT</span>
                                <span className="text-2xl font-black text-slate-800">{journey.flightNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Sheet - The White Card with side margins for "floating" look */}
                {/* Drag Handle representation */}
                <div className="bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.08)] flex-grow pb-24 relative pointer-events-auto mx-2 lg:mx-auto max-w-5xl border-x border-t border-slate-100 -mt-12 w-full">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-6" />

                    <div className="max-w-4xl mx-auto px-6 lg:px-12">
                        {/* Header Info in Sheet */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                                        {journey.from.split(' (')[0]}
                                    </h1>
                                    <span className="text-2xl font-bold text-slate-300">→</span>
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                                        {journey.to.split(' (')[0]}
                                    </h1>
                                </div>
                                <p className="text-slate-500 font-bold tracking-tight">Scheduled for {dayjs(journey.date).format('dddd, MMMM DD')}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* User Profile Section */}
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg">
                                            <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-sky-500 p-1.5 rounded-xl border-4 border-white shadow-sm">
                                            <VerifiedIcon sx={{ color: 'white', fontSize: 14 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{journey.user.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Member</span>
                                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-lg text-[10px] font-black">★ {journey.user.rating.toFixed(1)}</span>
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
                                        sx={{ color: '#1e293b', borderColor: '#e2e8f0', borderRadius: '1.2rem', py: 2, fontWeight: 900, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' } }}
                                    >
                                        Email
                                    </Button>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="space-y-6">
                                <div className="p-8 bg-sky-50/50 rounded-[2.5rem] border border-sky-100/50">
                                    <h5 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em] mb-4">MATCH NOTES</h5>
                                    <p className="text-xl font-medium text-slate-700 leading-relaxed italic">
                                        "{journey.description}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-5 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
