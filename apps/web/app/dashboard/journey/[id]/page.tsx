"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import { ArrowBack as BackIcon, Share as ShareIcon, Verified as VerifiedIcon, WhatsApp as WhatsAppIcon, Mail as MailIcon } from "@mui/icons-material";
import { useJourneys, JourneyPost } from "../../../../context/JourneysContext";
import dayjs from "dayjs";

export default function JourneyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { journeys, loading } = useJourneys();
    const [journey, setJourney] = useState<JourneyPost | null>(null);

    useEffect(() => {
        if (!loading && journeys.length > 0) {
            const found = journeys.find((j: JourneyPost) => j.id === id);
            if (found) {
                setJourney(found);
            }
        }
    }, [id, journeys, loading]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'offwhite.main', '.dark &': { bgcolor: 'navy.main' } }}>
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    if (!journey) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-offwhite dark:bg-navy">
                <Typography variant="h4" sx={{ fontWeight: 'black', mb: 2, color: 'navy.main', '.dark &': { color: 'offwhite.main' } }}>Journey Not Found</Typography>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">This trip might have been removed or the link is incorrect.</p>
                <Button variant="contained" onClick={() => router.push('/dashboard')} sx={{ borderRadius: '1rem', px: 4, py: 1.5, bgcolor: 'navy.main', fontWeight: 900 }}>
                    Back to Feed
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-offwhite dark:bg-navy p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header Navigation */}
                <header className="flex items-center justify-between mb-8">
                    <IconButton
                        onClick={() => router.back()}
                        className="bg-white dark:bg-white/5 shadow-sm hover:scale-110 transition-all"
                    >
                        <BackIcon sx={{ color: 'text.primary' }} />
                    </IconButton>
                    <div className="flex gap-4">
                        <IconButton className="bg-white dark:bg-white/5 shadow-sm hover:scale-110 transition-all">
                            <ShareIcon sx={{ color: 'text.primary' }} />
                        </IconButton>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Hero Route Card */}
                        <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-xl border border-white/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest to-sand opacity-30" />

                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div className="text-center group">
                                    <h2 className="text-6xl font-black text-navy dark:text-offwhite group-hover:scale-105 transition-transform">{journey.from}</h2>
                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2">DEPARTURE</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center px-8">
                                    <div className="w-full h-[2px] bg-navy/10 dark:bg-white/10 relative rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-full bg-navy dark:bg-white animate-[shimmer_3s_infinite]" />
                                    </div>
                                    <div className="mt-4 bg-navy dark:bg-sand text-white dark:text-navy px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        Non-Stop Flight
                                    </div>
                                </div>

                                <div className="text-center group">
                                    <h2 className="text-6xl font-black text-navy dark:text-offwhite group-hover:scale-105 transition-transform">{journey.to}</h2>
                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2">ARRIVAL</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/10 pt-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Flight Partner</p>
                                    <p className="text-lg font-black text-navy dark:text-offwhite">{journey.flightNumber || "Not Specified"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Travel Date</p>
                                    <p className="text-lg font-black text-navy dark:text-offwhite">{dayjs(journey.date).format('MMMM DD, YYYY')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-sm border border-white/10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">About this Journey</h3>
                            <p className="text-xl font-medium text-navy/80 dark:text-offwhite/80 leading-relaxed italic">
                                "{journey.description}"
                            </p>

                            <div className="flex flex-wrap gap-3 mt-10">
                                {journey.tags.map((tag: string, idx: number) => (
                                    <span key={idx} className="px-5 py-2 bg-gray-50 dark:bg-white/10 rounded-2xl text-xs font-bold text-gray-500 dark:text-gray-400 border border-transparent hover:border-forest/20 transition-all hover:scale-105">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-navy dark:bg-sand p-10 rounded-[3rem] text-white dark:text-navy shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-xl">
                                            <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-forest p-1.5 rounded-xl border-4 border-navy dark:border-sand">
                                            <VerifiedIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-black mb-1">{journey.user.name}</h4>
                                        <div className="flex items-center gap-2 bg-white/10 dark:bg-black/10 px-3 py-1 rounded-full w-fit">
                                            <span className="text-xs font-bold">★ {journey.user.rating.toFixed(1)} Rating</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 bg-white/5 dark:bg-black/5 p-4 rounded-2xl border border-white/10">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/10 flex items-center justify-center">
                                            <span className="text-xl">✅</span>
                                        </div>
                                        <p className="text-sm font-bold opacity-90 leading-tight">Verified Companion with 12 successful journeys.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Connect with {journey.user.name.split(' ')[0]}</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="contained"
                                            startIcon={<WhatsAppIcon />}
                                            sx={{
                                                bgcolor: 'forest.main',
                                                color: 'white',
                                                borderRadius: '1.5rem',
                                                py: 1.5,
                                                fontWeight: 900,
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: '#059669', transform: 'translateY(-2px)' },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            WhatsApp
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<MailIcon />}
                                            sx={{
                                                bgcolor: 'white',
                                                color: 'navy.main',
                                                borderRadius: '1.5rem',
                                                py: 1.5,
                                                fontWeight: 900,
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: '#f3f4f6', transform: 'translateY(-2px)' },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Email
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Flight Map Placeholder */}
                        <div className="bg-offwhite dark:bg-white/5 p-8 rounded-[3rem] border border-navy/5 dark:border-white/5 relative h-64 overflow-hidden group">
                            <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                                <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M50 150C120 100 280 50 350 100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                    <circle cx="50" cy="150" r="4" fill="currentColor" />
                                    <circle cx="350" cy="100" r="4" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                                <Typography variant="h6" className="text-navy dark:text-offwhite" sx={{ fontWeight: 900, mb: 1 }}>Visual Route</Typography>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-xs">Connecting {journey.from} and {journey.to} via {journey.flightNumber}.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
