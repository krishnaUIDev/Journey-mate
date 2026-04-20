"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, CircularProgress, Button, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { ArrowBack as BackIcon, FlightTakeoff as FlightIcon, CheckCircle as VerifiedIcon } from "@mui/icons-material";
import { AirportAutocomplete } from "../components/AirportAutocomplete";
import { useJourneys } from "../../../context/JourneysContext";
import { useUser } from "@clerk/nextjs";
import { verifyFlight, getFlightsOnRoute, FlightDetails } from "../../../lib/flightApi";

export default function PostJourneyPage() {
    const router = useRouter();
    const { user } = useUser();
    const { addJourney } = useJourneys();

    const [submitting, setSubmitting] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [flightNumber, setFlightNumber] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [description, setDescription] = useState("");

    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<"idle" | "found" | "not_found">("idle");
    const [suggestedFlights, setSuggestedFlights] = useState<FlightDetails[]>([]);
    const [loadingFlights, setLoadingFlights] = useState(false);

    // Auto-discover flights when route and date are selected
    useEffect(() => {
        const discoverFlights = async () => {
            const depIata = from.split(' (')[1]?.replace(')', '');
            const arrIata = to.split(' (')[1]?.replace(')', '');

            if (depIata && arrIata && depIata.length === 3 && arrIata.length === 3 && date) {
                setLoadingFlights(true);
                try {
                    const flights = await getFlightsOnRoute(depIata, arrIata);
                    setSuggestedFlights(flights);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingFlights(false);
                }
            } else {
                setSuggestedFlights([]);
                setFlightNumber("");
            }
        };

        discoverFlights();
    }, [from, to, date]);

    const handleSelectFlight = (flight: FlightDetails) => {
        setFlightNumber(flight.flight.iata);
        setVerificationStatus("found");
        if (flight.flight_date) setDate(dayjs(flight.flight_date));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addJourney({
                from: from.split(' (')[1]?.replace(')', '') || from,
                to: to.split(' (')[1]?.replace(')', '') || to,
                date: date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
                flightNumber,
                contactInfo,
                description,
                user: {
                    name: user?.fullName || "A Traveler",
                    avatar: user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`,
                    rating: 5.0,
                    verified: true
                },
                tags: ["New Trip", "Verified"]
            });
            router.push('/dashboard');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-offwhite dark:bg-navy p-8 lg:p-16">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <IconButton
                            onClick={() => router.back()}
                            className="bg-white dark:bg-white/5 shadow-sm hover:scale-110 transition-all"
                        >
                            <BackIcon sx={{ color: 'text.primary' }} />
                        </IconButton>
                        <div>
                            <h1 className="text-4xl font-black text-navy dark:text-offwhite">Post a New Journey</h1>
                            <p className="text-gray-500 dark:text-offwhite/50 font-medium">Find a companion for your next flight.</p>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Form Side */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-xl border border-white/20">
                            <div className="grid grid-cols-2 gap-6">
                                <AirportAutocomplete
                                    label="From"
                                    placeholder="Origin Airport"
                                    value={from}
                                    onChange={setFrom}
                                />
                                <AirportAutocomplete
                                    label="To"
                                    placeholder="Destination"
                                    value={to}
                                    onChange={setTo}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Departure Date
                                    </Typography>
                                    <DatePicker
                                        value={date}
                                        onChange={(newValue) => setDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'standard',
                                                slotProps: {
                                                    input: {
                                                        disableUnderline: true,
                                                        sx: {
                                                            px: 3, py: 1.2, bgcolor: 'rgba(0,0,0,0.03)',
                                                            '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                                            borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Contact Details
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="WhatsApp / Email"
                                        variant="standard"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        slotProps={{
                                            input: {
                                                disableUnderline: true,
                                                sx: {
                                                    px: 3, py: 1.2, bgcolor: 'rgba(0,0,0,0.03)',
                                                    '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                                    borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">Journey Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe your trip, luggage help needed, or preferred conversation topics..."
                                    className="w-full px-8 py-6 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-[2rem] text-navy dark:text-offwhite font-medium focus:ring-4 focus:ring-forest/10 outline-none transition-all resize-none shadow-inner"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={submitting || !from || !to || !flightNumber}
                                sx={{
                                    py: 2.5,
                                    borderRadius: '1.5rem',
                                    bgcolor: 'navy.main',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: '0.75rem',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        bgcolor: 'forest.main'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        color: 'rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                {submitting ? "Publishing..." : flightNumber ? "Publish Journey" : "Select a Flight to Continue"}
                            </Button>
                        </form>
                    </div>

                    {/* Flight Discovery Side */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-forest/5 dark:bg-sand/5 p-8 rounded-[2.5rem] border border-forest/10 dark:border-sand/10">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <FlightIcon sx={{ color: 'forest.main' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'offwhite.main' } }}>
                                        Suggested Flights
                                    </Typography>
                                </Box>

                                {loadingFlights ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : suggestedFlights.length > 0 ? (
                                    <div className="space-y-3">
                                        {suggestedFlights.map((flight, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectFlight(flight)}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${flightNumber === flight.flight.iata
                                                    ? 'bg-forest text-white border-forest shadow-lg scale-105'
                                                    : 'bg-white dark:bg-white/5 border-transparent hover:border-forest/30 dark:hover:border-sand/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-black tracking-widest">{flight.flight.iata}</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${flightNumber === flight.flight.iata ? 'bg-white/20' : 'bg-forest/10 text-forest'
                                                        }`}>
                                                        Scheduled
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold opacity-60 uppercase">{flight.airline.name}</p>
                                                        <p className="text-sm font-black">{dayjs(flight.departure.scheduled).format('HH:mm')} → {dayjs(flight.arrival.scheduled).format('HH:mm')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, px: 4 }}>
                                            Select an origin and destination to see available flights.
                                        </Typography>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-navy dark:bg-white/5 rounded-[2.5rem] text-white">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>🛡️</span> Safety Tip
                                </h4>
                                <p className="text-xs text-offwhite/70 leading-relaxed font-medium">
                                    Verified flight numbers help us match you with the right companion. Always check your booking details before publishing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
