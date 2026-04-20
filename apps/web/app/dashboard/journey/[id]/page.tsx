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
        <div className="relative min-h-screen bg-[#F2F2F7] dark:bg-black text-navy dark:text-white transition-colors duration-500 overflow-hidden font-inter">
            {/* 1. Full-Screen Background Map Layer */}
            <div className="absolute inset-0 z-0">
                {/* Background Dot Grid */}
                <div className="absolute inset-0 opacity-20 dark:opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle, #8E8E93 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />

                {/* Immersive Route Line */}
                <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-32">
                    <div className="w-full max-w-7xl relative h-[400px]">
                        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#D9D2C5" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            {/* Curved Connection Path */}
                            <path
                                d="M 100 200 Q 500 50 900 200"
                                stroke="url(#routeGradient)"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray="10 6"
                                className="animate-[lineShimmer_15s_linear_infinite]"
                            />
                            {/* Origin & Destination Nodes */}
                            <g className="origin-node">
                                <circle cx="100" cy="200" r="10" className="fill-white dark:fill-navy stroke-forest stroke-[4]" />
                                <circle cx="100" cy="200" r="20" className="fill-forest/20 animate-pulse" />
                            </g>
                            <g className="destination-node">
                                <circle cx="900" cy="200" r="10" className="fill-white dark:fill-navy stroke-sand stroke-[4]" />
                                <circle cx="900" cy="200" r="20" className="fill-sand/20 animate-pulse" />
                            </g>
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. Top-Floating Navigation Overlay */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                <IconButton
                    onClick={() => router.back()}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', scale: 1.1 },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <BackIcon sx={{ color: 'white' }} />
                </IconButton>
                <div className="flex gap-4">
                    <Button
                        variant="contained"
                        startIcon={<ShareIcon />}
                        sx={{
                            bgcolor: 'white', color: 'navy.main', borderRadius: '1.2rem', px: 3, py: 1.2, fontWeight: 900,
                            fontSize: '0.75rem', textTransform: 'none', shadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        Share
                    </Button>
                </div>
            </header>

            {/* 3. Central Dynamic Route Information */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-10 px-4">
                <div className="flex items-center justify-center gap-4 lg:gap-16 mb-4">
                    <div className="text-right">
                        <Typography variant="h1" className="text-8xl lg:text-[12rem] font-black tracking-tighter leading-none opacity-10 dark:opacity-20 select-none">
                            {journey.from.split(' (')[1]?.replace(')', '') || journey.from}
                        </Typography>
                    </div>
                    <div className="bg-sand/20 dark:bg-white/10 p-4 rounded-[2rem] backdrop-blur-xl border border-white/10 pointer-events-auto">
                        <Typography className="text-xs font-black tracking-[0.4em] text-navy dark:text-white uppercase mb-2">FLIGHT</Typography>
                        <Typography variant="h4" className="font-black text-navy dark:text-white tracking-widest">{journey.flightNumber}</Typography>
                    </div>
                    <div className="text-left">
                        <Typography variant="h1" className="text-8xl lg:text-[12rem] font-black tracking-tighter leading-none opacity-10 dark:opacity-20 select-none">
                            {journey.to.split(' (')[1]?.replace(')', '') || journey.to}
                        </Typography>
                    </div>
                </div>
                <Typography className="text-sm font-bold text-gray-500 uppercase tracking-[0.5em] mt-4">Verified Live Status • Active Route</Typography>
            </div>

            {/* 4. Anchored Bottom Information Panel (Flighty Style) */}
            <div className="absolute bottom-0 left-0 w-full z-40 p-6 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                        {/* Companion & Fast Actions Card */}
                        <div className="lg:col-span-4 bg-white/70 dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl flex flex-col justify-between">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white/40 shadow-xl ring-4 ring-forest/20">
                                        <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-forest p-1.5 rounded-xl border-4 border-white dark:border-navy">
                                        <VerifiedIcon sx={{ color: 'white', fontSize: 16 }} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-navy dark:text-white leading-none mb-1">{journey.user.name}</h4>
                                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <span>Verified</span> • <span>★ {journey.user.rating.toFixed(1)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <Button
                                    variant="contained"
                                    startIcon={<WhatsAppIcon />}
                                    sx={{
                                        bgcolor: 'forest.main', color: 'white', borderRadius: '1.2rem', py: 1.5, fontWeight: 900, fontSize: '0.7rem',
                                        '&:hover': { bgcolor: '#059669' }
                                    }}
                                >
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<MailIcon />}
                                    sx={{
                                        bgcolor: 'navy.main', color: 'white', borderRadius: '1.2rem', py: 1.5, fontWeight: 900, fontSize: '0.7rem',
                                        '&:hover': { bgcolor: '#1a2a4a' }
                                    }}
                                >
                                    Email
                                </Button>
                            </div>
                        </div>

                        {/* Trip Details & Status Row */}
                        <div className="lg:col-span-8 bg-white/70 dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="flex flex-col items-end">
                                    <Typography className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DEPARTURE DATE</Typography>
                                    <Typography variant="h5" className="font-black text-navy dark:text-offwhite">{dayjs(journey.date).format('MMMM DD')}</Typography>
                                </div>
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">MATCH NOTES</h5>
                                    <p className="text-lg font-medium text-navy/80 dark:text-offwhite/90 leading-tight italic line-clamp-3">
                                        "{journey.description}"
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-white/10 flex flex-wrap gap-2">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-4 py-1.5 bg-navy/5 dark:bg-white/10 rounded-full text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
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
