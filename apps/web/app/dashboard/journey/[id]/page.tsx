'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useJourneys } from "../../../../context/JourneysContext";
import Script from 'next/script';
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

declare global {
    interface Window {
        mapkit: any;
    }
}

export default function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { journeys } = useJourneys();
    const [journey, setJourney] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const found = journeys.find((j: any) => j.id === id);
        if (found) setJourney(found);
    }, [id, journeys]);

    const initMap = () => {
        if (!window.mapkit || !journey) return;

        const token = process.env.NEXT_PUBLIC_MAPKIT_JS_TOKEN;
        if (!token) {
            console.warn("MapKit JS token missing. Falling back to SVG.");
            return;
        }

        window.mapkit.init({
            authorizationCallback: (done: any) => done(token)
        });

        // Initialize Map
        const map = new window.mapkit.Map("apple-map-container", {
            showsCompass: window.mapkit.FeatureVisibility.Hidden,
            showsZoomControl: window.mapkit.FeatureVisibility.Hidden,
            showsMapTypeControl: window.mapkit.FeatureVisibility.Hidden,
            colorScheme: window.mapkit.ColorScheme.Dark,
            mapType: window.mapkit.MapType.MutedStandard
        });

        mapRef.current = map;
        setMapLoaded(true);

        const search = new window.mapkit.Search();

        const geocodeAirport = (name: string) => {
            return new Promise((resolve) => {
                const iata = name.match(/\((.*?)\)/)?.[1] || name;
                search.search(iata, (error: any, data: any) => {
                    if (data && data.places && data.places[0]) {
                        resolve(data.places[0].coordinate);
                    } else {
                        resolve(null);
                    }
                });
            });
        };

        Promise.all([
            geocodeAirport(journey.from),
            geocodeAirport(journey.to)
        ]).then(([origin, dest]: any) => {
            if (origin && dest) {
                // Add Markers
                const originAnnotation = new window.mapkit.MarkerAnnotation(origin, {
                    title: journey.from.split(' (')[1]?.replace(')', '') || "Origin",
                    color: "#10B981",
                    glyphText: "🛫"
                });
                const destAnnotation = new window.mapkit.MarkerAnnotation(dest, {
                    title: journey.to.split(' (')[1]?.replace(')', '') || "Destination",
                    color: "#D9D2C5",
                    glyphText: "🛬"
                });

                map.addAnnotations([originAnnotation, destAnnotation]);

                // Draw Geodesic Polyline
                const polyline = new window.mapkit.PolylineOverlay([origin, dest], {
                    style: new window.mapkit.Style({
                        strokeColor: "#10B981",
                        lineWidth: 3,
                        lineJoin: "round",
                        lineCap: "round",
                        lineDash: [10, 6]
                    }),
                    geodesic: true
                });
                map.addOverlay(polyline);

                // Adjust view
                map.showItems([originAnnotation, destAnnotation], {
                    minimumSpan: new window.mapkit.CoordinateSpan(10, 10),
                    animate: true,
                    padding: new window.mapkit.Padding(100, 100, 500, 100)
                });
            }
        });
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

    return (
        <div className="relative min-h-screen bg-black text-white transition-colors duration-500 overflow-hidden font-inter">
            <Script
                src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
                onLoad={initMap}
            />

            {/* 1. Full-Screen Background Map Layer */}
            <div className="absolute inset-0 z-0">
                <div id="apple-map-container" className={`w-full h-full transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`} />

                {!mapLoaded && (
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-20 dark:opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #8E8E93 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
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
                                    <path d="M 100 200 Q 500 50 900 200" stroke="url(#routeGradient)" strokeWidth="3" fill="none" strokeDasharray="10 6" className="animate-[lineShimmer_15s_linear_infinite]" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Top-Floating Navigation Overlay */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                <IconButton onClick={() => router.back()} sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', scale: 1.1 }, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <BackIcon sx={{ color: 'white' }} />
                </IconButton>
                <div className="flex gap-4">
                    <Button variant="contained" startIcon={<ShareIcon />} sx={{ bgcolor: 'white', color: 'navy', borderRadius: '1.2rem', px: 3, py: 1.2, fontWeight: 900, fontSize: '0.75rem', textTransform: 'none', shadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        Share
                    </Button>
                </div>
            </header>

            {/* 3. Central Dynamic Route Information */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-10 px-4 transition-all duration-1000 ${mapLoaded ? 'opacity-20 translate-y-[-200px]' : 'opacity-100'}`}>
                <div className="flex items-center justify-center gap-4 lg:gap-16 mb-4">
                    <div className="text-right">
                        <Typography variant="h1" className="text-8xl lg:text-[12rem] font-black tracking-tighter leading-none opacity-20 select-none">
                            {journey.from.split(' (')[1]?.replace(')', '') || journey.from}
                        </Typography>
                    </div>
                    <div className="bg-sand/20 dark:bg-white/10 p-4 rounded-[2rem] backdrop-blur-xl border border-white/10 pointer-events-auto">
                        <Typography className="text-xs font-black tracking-[0.4em] text-white uppercase mb-2">FLIGHT</Typography>
                        <Typography variant="h4" className="font-black text-white tracking-widest">{journey.flightNumber}</Typography>
                    </div>
                    <div className="text-left">
                        <Typography variant="h1" className="text-8xl lg:text-[12rem] font-black tracking-tighter leading-none opacity-20 select-none">
                            {journey.to.split(' (')[1]?.replace(')', '') || journey.to}
                        </Typography>
                    </div>
                </div>
            </div>

            {/* 4. Anchored Bottom Information Panel (Flighty Style) */}
            <div className="absolute bottom-0 left-0 w-full z-40 p-6 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                        {/* Companion Card */}
                        <div className="lg:col-span-4 bg-white/70 dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl flex flex-col justify-between">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white/40 shadow-xl ring-4 ring-forest/20">
                                        <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-forest p-1.5 rounded-xl border-4 border-white dark:border-black">
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
                                <Button variant="contained" startIcon={<WhatsAppIcon />} sx={{ bgcolor: '#10B981', color: 'white', borderRadius: '1.2rem', py: 1.5, fontWeight: 900, '&:hover': { bgcolor: '#059669' } }}>WhatsApp</Button>
                                <Button variant="contained" startIcon={<MailIcon />} sx={{ bgcolor: '#0B1120', color: 'white', borderRadius: '1.2rem', py: 1.5, fontWeight: 900, '&:hover': { bgcolor: '#1a2a4a' } }}>Email</Button>
                            </div>
                        </div>

                        {/* Trip Notes Card */}
                        <div className="lg:col-span-8 bg-white/70 dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 text-right">
                                <Typography className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DEPARTURE</Typography>
                                <Typography variant="h5" className="font-black text-navy dark:text-gray-200">{dayjs(journey.date).format('MMMM DD')}</Typography>
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">MATCH NOTES</h5>
                                    <p className="text-xl font-medium text-navy/80 dark:text-white/90 leading-tight italic line-clamp-2">"{journey.description}"</p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-white/10 flex flex-wrap gap-2">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-4 py-1.5 bg-navy/5 dark:bg-white/10 rounded-full text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">#{tag}</span>
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
