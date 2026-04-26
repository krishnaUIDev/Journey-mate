"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, CircularProgress, Button, IconButton, Tooltip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
    ArrowBack as BackIcon,
    FlightTakeoff as FlightIcon,
    CheckCircle as VerifiedIcon,
    AutoFixHigh as AIStatusIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    WhatsApp as WhatsAppIcon,
    Instagram as InstagramIcon,
    Email as MailIcon
} from "@mui/icons-material";
import { scanBoardingPass } from "../../actions/aiScanner";
import { AirportAutocomplete } from "../components/AirportAutocomplete";
import { useJourneys } from "../../../context/JourneysContext";
import { useUser } from "@clerk/nextjs";
import { verifyFlight, getFlightsOnRoute, FlightDetails } from "../../../lib/flightApi";
import { supabase } from "../../../lib/supabase";
import Image from "next/image";
import dynamic from "next/dynamic";

const AirlineSearchBox = dynamic(() => import("../components/AirlineSearchBox").then(mod => mod.AirlineSearchBox), { ssr: false });

export default function PostJourneyPage() {
    const router = useRouter();
    const { user } = useUser();
    const { journeys, addJourney } = useJourneys();

    const [submitting, setSubmitting] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [flightNumber, setFlightNumber] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram' | 'email'>('whatsapp');
    const [description, setDescription] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const [airlineName, setAirlineName] = useState("");
    const [airlineIata, setAirlineIata] = useState("");
    const [boardingPassUrl, setBoardingPassUrl] = useState("");
    const [uploadingPass, setUploadingPass] = useState(false);
    const [layovers, setLayovers] = useState<string[]>([]);
    const [routeCoords, setRouteCoords] = useState<Record<string, [number, number]>>({});
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleBoardingPassUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        setUploadingPass(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `passes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('boarding_passes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('boarding_passes')
                .getPublicUrl(filePath);

            setBoardingPassUrl(publicUrl);

            /* AI SCANNER DISABLED FOR NOW
            setIsScanning(true);
            try {
                // Convert file to base64 for Gemini
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    const result = await scanBoardingPass(base64, file.type);

                    if (result) {
                        if (result.origin) setFrom(result.origin);
                        if (result.destination) setTo(result.destination);
                        if (result.flight_number) setFlightNumber(result.flight_number);
                        if (result.airline) setAirlineName(result.airline);
                        if (result.date) setDate(dayjs(result.date));
                    }
                    setIsScanning(false);
                };
            } catch (scanErr) {
                console.error("Scanning failed:", scanErr);
                setIsScanning(false);
            }
            */
        } catch (err: any) {
            console.error("Error uploading boarding pass:", err);
            alert("Error uploading boarding pass: " + err.message);
        } finally {
            setUploadingPass(false);
        }
    };

    const handleAISuggestNotes = async () => {
        if (!from || !to) return;
        setIsGenerating(true);
        try {
            const originCity = from.split(' (')[0];
            const destCity = to.split(' (')[0];

            const moods = [
                `Traveling from ${originCity} to ${destCity}. Looking for a friendly companion to share stories and a coffee at the airport!`,
                `Trip from ${originCity} to ${destCity} for work. Prefer a quiet, professional companion to focus on work during the flight.`,
                `Flying solo from ${originCity} and happy to help anyone needing a hand with luggage or navigating the terminal.`
            ];

            const suggestion = moods[Math.floor(Math.random() * moods.length)];

            await new Promise(resolve => setTimeout(resolve, 800));
            setDescription(suggestion || "");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);

        const selectedDate = date?.format('YYYY-MM-DD');
        const isDuplicate = journeys.some(j =>
            j.user.name === (user?.fullName || "A Traveler") &&
            j.date === selectedDate
        );

        if (isDuplicate) {
            setErrorMessage(`You already have a journey posted for ${selectedDate}. You can only post one journey per day.`);
            setSubmitting(false);
            return;
        }

        if (!contactInfo || contactInfo.trim().length < 3) {
            setErrorMessage(`Please enter your ${contactMethod} details so travelers can reach you.`);
            setSubmitting(false);
            return;
        }

        // Validate formats
        if (contactMethod === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactInfo.trim())) {
                setErrorMessage("Please enter a valid email address.");
                setSubmitting(false);
                return;
            }
        } else if (contactMethod === 'whatsapp') {
            const digits = contactInfo.replace(/[^0-9]/g, '');
            if (digits.length < 8) {
                setErrorMessage("Please enter a valid WhatsApp number (at least 8 digits).");
                setSubmitting(false);
                return;
            }
        } else if (contactMethod === 'instagram') {
            const handle = contactInfo.trim().replace('@', '');
            if (handle.length < 2 || /[^a-zA-Z0-9._]/.test(handle)) {
                setErrorMessage("Please enter a valid Instagram username (letters, numbers, dots, and underscores only).");
                setSubmitting(false);
                return;
            }
        }

        let formattedContact = contactInfo.trim();
        if (contactMethod === 'instagram' && !formattedContact.startsWith('@')) {
            formattedContact = `@${formattedContact}`;
        } else if (contactMethod === 'whatsapp') {
            formattedContact = formattedContact.replace(/[^0-9]/g, '');
        }

        try {
            await addJourney({
                userId: user?.id || "",
                from: from.split(' (')[1]?.replace(')', '') || from,
                to: to.split(' (')[1]?.replace(')', '') || to,
                date: selectedDate || dayjs().format('YYYY-MM-DD'),
                flightNumber,
                airlineName,
                airlineIata,
                layovers: layovers.map(l => l.split(' (')[1]?.replace(')', '') || l),
                contactInfo: formattedContact,
                description,
                user: {
                    name: user?.fullName || "A Traveler",
                    avatar: user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`,
                    rating: 0,
                    verified: false,
                    verificationTier: 'bronze'
                },
                tags: ["New Trip"],
                status: 'upcoming',
                routeData: routeCoords,
                boardingPassUrl
            });
            router.push('/dashboard');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-offwhite dark:bg-navy p-4 lg:p-10">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <IconButton
                            onClick={() => router.back()}
                            className="bg-white dark:bg-white/5 shadow-sm hover:scale-110 transition-all border border-gray-100 dark:border-white/10"
                        >
                            <BackIcon className="text-navy dark:text-offwhite" />
                        </IconButton>
                        <div>
                            <h1 className="text-3xl font-black text-navy dark:text-offwhite">Post a New Journey</h1>
                            <p className="text-sm text-gray-500 dark:text-offwhite/50 font-medium">Connect with companions on your route.</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden relative">
                    {/* Background accents */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-forest/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sand/5 rounded-full blur-3xl" />

                    <div className="relative space-y-8">
                        {/* Route Section */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 bg-forest/40 rounded-full" /> Boarding Pass (Optional)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <AirportAutocomplete
                                    label="Origin"
                                    placeholder="City or Airport (e.g. HYD)"
                                    value={from}
                                    onChange={(val, coords) => {
                                        setFrom(val);
                                        if (coords) {
                                            const code = val.split(' (')[1]?.replace(')', '') || val;
                                            setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                        }
                                    }}
                                />
                                <AirportAutocomplete
                                    label="Destination"
                                    placeholder="City or Airport (e.g. JFK)"
                                    value={to}
                                    onChange={(val, coords) => {
                                        setTo(val);
                                        if (coords) {
                                            const code = val.split(' (')[1]?.replace(')', '') || val;
                                            setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Flight Details Section */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 bg-sand rounded-full" /> Flight Details
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <AirlineSearchBox
                                    label="Airline Name"
                                    placeholder="e.g. Emirates"
                                    value={airlineName}
                                    onChange={(name, iata) => {
                                        setAirlineName(name);
                                        if (iata) setAirlineIata(iata);
                                    }}
                                />
                                <div className="space-y-1.5">
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Flight Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. EK501"
                                        variant="standard"
                                        value={flightNumber}
                                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                        slotProps={{
                                            input: {
                                                disableUnderline: true,
                                                sx: {
                                                    px: 3, py: 1.5, bgcolor: 'rgba(0,0,0,0.03)',
                                                    '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                                    borderRadius: '1.25rem', fontSize: '0.875rem', fontWeight: 700
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Boarding Pass Section */}
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-1 h-1 bg-amber-500 rounded-full" /> Trust & Verification
                                    </label>
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center gap-4">
                                        <div className="text-center">
                                            <h4 className="font-bold text-sm text-navy dark:text-offwhite mb-1">Boarding Pass (Optional)</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">Adds a verification badge to your trip for more trust.</p>
                                        </div>

                                        {boardingPassUrl ? (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 group">
                                                <Image
                                                    src={boardingPassUrl}
                                                    alt="Boarding Pass Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => setBoardingPassUrl("")}
                                                        sx={{ borderRadius: '1rem', fontWeight: 900 }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => inputRef.current?.click()}
                                                className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/10"
                                            >
                                                {uploadingPass ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : isScanning ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CircularProgress size={24} color="inherit" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Pass...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-2xl">📸</span>
                                                        <span className="text-[10px] font-black text-forest uppercase">Upload Pass</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={inputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleBoardingPassUpload}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Layovers (Optional)
                                    </Typography>
                                    <div className="space-y-3">
                                        {layovers.map((l, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <div className="flex-1">
                                                    <AirportAutocomplete
                                                        label=""
                                                        placeholder={`Layover ${idx + 1}`}
                                                        value={l}
                                                        onChange={(val, coords) => {
                                                            const newL = [...layovers];
                                                            newL[idx] = val;
                                                            setLayovers(newL);
                                                            if (coords) {
                                                                const code = val.split(' (')[1]?.replace(')', '') || val;
                                                                setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setLayovers(layovers.filter((_, i) => i !== idx))}
                                                    sx={{ mt: 2, color: 'error.main' }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </div>
                                        ))}
                                        <Button
                                            startIcon={<AddIcon />}
                                            disabled={layovers.length > 0 && !layovers[layovers.length - 1]}
                                            onClick={() => setLayovers([...layovers, ""])}
                                            size="small"
                                            sx={{
                                                alignSelf: 'flex-start',
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                fontSize: '11px',
                                                color: 'forest.main',
                                                bgcolor: 'rgba(34, 197, 94, 0.05)',
                                                borderRadius: '1rem',
                                                px: 2,
                                                '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.1)' },
                                                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.03)', color: 'text.disabled' }
                                            }}
                                        >
                                            Add Layover
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Travel Date
                                    </Typography>
                                    <DatePicker
                                        value={date}
                                        onChange={(newValue) => {
                                            setDate(newValue);
                                            // Clear error if it was about the date limit
                                            if (errorMessage?.includes("already have a journey posted")) {
                                                setErrorMessage(null);
                                            }
                                        }}
                                        disablePast
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'standard',
                                                slotProps: {
                                                    input: {
                                                        disableUnderline: true,
                                                        sx: {
                                                            px: 3, py: 1.3, bgcolor: 'rgba(0,0,0,0.03)',
                                                            '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                                            borderRadius: '1.25rem', fontSize: '0.875rem', fontWeight: 700
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Section */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 bg-sky-400 rounded-full" /> Additional Info
                            </label>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Preferred Contact Method
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {[
                                            { id: 'whatsapp', icon: <WhatsAppIcon />, label: 'WhatsApp', color: '#22c55e' },
                                            { id: 'instagram', icon: <InstagramIcon />, label: 'Instagram', color: '#dc2743' },
                                            { id: 'email', icon: <MailIcon />, label: 'Email', color: '#3b82f6' }
                                        ].map((method) => (
                                            <Button
                                                key={method.id}
                                                variant={contactMethod === method.id ? "contained" : "outlined"}
                                                onClick={() => {
                                                    setContactMethod(method.id as any);
                                                    setContactInfo(""); // Clear when switching for clarity
                                                }}
                                                startIcon={method.icon}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: '1.25rem',
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    py: 1,
                                                    fontSize: '0.75rem',
                                                    bgcolor: contactMethod === method.id ? method.color : 'transparent',
                                                    color: contactMethod === method.id ? 'white' : 'text.primary',
                                                    borderColor: contactMethod === method.id ? method.color : 'rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        bgcolor: contactMethod === method.id ? method.color : 'rgba(0,0,0,0.05)',
                                                        borderColor: method.color
                                                    },
                                                    '.dark &': {
                                                        color: contactMethod === method.id ? 'white' : 'offwhite'
                                                    }
                                                }}
                                            >
                                                {method.label}
                                            </Button>
                                        ))}
                                    </Box>

                                    <TextField
                                        fullWidth
                                        placeholder={
                                            contactMethod === 'whatsapp' ? "WhatsApp Number (e.g. +1...)" :
                                                contactMethod === 'instagram' ? "Instagram Username (e.g. travel_buddy)" :
                                                    "Email Address (e.g. name@example.com)"
                                        }
                                        variant="standard"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        slotProps={{
                                            input: {
                                                disableUnderline: true,
                                                sx: {
                                                    px: 3, py: 1.5, bgcolor: 'rgba(0,0,0,0.03)',
                                                    '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                                    borderRadius: '1.25rem', fontSize: '0.875rem', fontWeight: 700
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between pr-2">
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                            Trip Notes
                                        </Typography>
                                        <Tooltip title="AI Suggestion based on your route">
                                            <IconButton
                                                size="small"
                                                onClick={handleAISuggestNotes}
                                                disabled={isGenerating || !from || !to}
                                                sx={{
                                                    color: 'forest.main',
                                                    bgcolor: 'rgba(34, 197, 94, 0.05)',
                                                    '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.1)' }
                                                }}
                                            >
                                                {isGenerating ? <CircularProgress size={14} color="inherit" /> : <AIStatusIcon sx={{ fontSize: 16 }} />}
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe your trip, luggage help needed, or topics you love to chat about..."
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-[1.5rem] text-navy dark:text-offwhite font-medium focus:ring-4 focus:ring-forest/10 outline-none transition-all resize-none shadow-inner text-sm leading-relaxed"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-5 rounded-3xl flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', lineHeight: 1.4 }}>
                                    {errorMessage}
                                </Typography>
                            </div>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={submitting || !from || !to || !flightNumber || !airlineName || !!errorMessage}
                            sx={{
                                py: 2.5,
                                borderRadius: '1.5rem',
                                bgcolor: 'navy.main',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                fontSize: '0.85rem',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                '&:hover': {
                                    bgcolor: 'forest.main',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 25px 45px rgba(0,0,0,0.25)',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    color: 'rgba(0,0,0,0.2)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Publish Trip"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
