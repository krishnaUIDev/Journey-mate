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
    const { journeys, addJourney } = useJourneys();

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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setErrorMessage(null); // Clear error when date/route changes
    }, [from, to, date]);

    const handleSelectFlight = (flight: FlightDetails) => {
        if (flight.flight_status === 'cancelled') return;
        setFlightNumber(flight.flight.iata);
        setVerificationStatus("found");
        if (flight.flight_date) setDate(dayjs(flight.flight_date));
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
            setErrorMessage("Contact Details (WhatsApp, Email, or Instagram) are required so travelers can reach you.");
            setSubmitting(false);
            return;
        }

        try {
            await addJourney({
                userId: user?.id || undefined,
                from: from.split(' (')[1]?.replace(')', '') || from,
                to: to.split(' (')[1]?.replace(')', '') || to,
                date: selectedDate || dayjs().format('YYYY-MM-DD'),
                flightNumber,
                contactInfo,
                description,
                user: {
                    name: user?.fullName || "A Traveler",
                    avatar: user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`,
                    rating: 0,
                    verified: false
                },
                tags: ["New Trip"]
            });
            router.push('/dashboard');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-offwhite dark:bg-navy p-4 lg:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <IconButton
                            onClick={() => router.back()}
                            className="bg-white dark:bg-white/5 shadow-sm hover:scale-110 transition-all"
                        >
                            <BackIcon sx={{ color: 'text.primary' }} />
                        </IconButton>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-navy dark:text-offwhite">Post a New Journey</h1>
                            <p className="text-sm text-gray-500 dark:text-offwhite/50 font-medium">Find a companion for your next flight.</p>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    {/* Form Side */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-white/5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-white/20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                                        Departure Date
                                    </Typography>
                                    <DatePicker
                                        value={date}
                                        onChange={(newValue) => setDate(newValue)}
                                        disablePast
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
                                        placeholder="WhatsApp / Email / Instagram"
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

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">Journey Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Describe your trip, luggage help needed, or preferred conversation topics..."
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-[1.5rem] text-navy dark:text-offwhite font-medium focus:ring-4 focus:ring-forest/10 outline-none transition-all resize-none shadow-inner text-sm"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {errorMessage && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-5 rounded-3xl mb-6 flex items-center gap-3">
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
                                disabled={submitting || !from || !to || !flightNumber || !!errorMessage}
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
                    <div className="lg:col-span-2 sticky top-[88px]">
                        <div className="bg-forest/5 dark:bg-sand/5 p-6 rounded-[2rem] border border-forest/10 dark:border-sand/10 max-h-[calc(100vh-140px)] flex flex-col shadow-sm">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexShrink: 0 }}>
                                <FlightIcon sx={{ color: 'forest.main' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'offwhite.main' } }}>
                                    Suggested Flights
                                </Typography>
                            </Box>

                            <div className="overflow-y-auto pr-1 scrollbar-hide">
                                {loadingFlights ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : suggestedFlights.length > 0 ? (
                                    <div className="space-y-2">
                                        {suggestedFlights.map((flight, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => flight.flight_status !== 'cancelled' && handleSelectFlight(flight)}
                                                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-4 ${flight.flight_status === 'cancelled'
                                                    ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50 dark:bg-white/5 border-transparent'
                                                    : flightNumber === flight.flight.iata
                                                        ? 'bg-forest text-white border-forest shadow-lg scale-[1.02]'
                                                        : 'bg-white dark:bg-white/5 border-transparent hover:border-forest/30 dark:hover:border-sand/30 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-black/5 shadow-sm">
                                                    <img
                                                        src={`https://www.gstatic.com/flights/airline_logos/70px/${flight.airline.iata}.png`}
                                                        alt={flight.airline.name}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + flight.airline.iata;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="text-[10px] font-black tracking-widest uppercase">{flight.flight.iata}</span>
                                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${flightNumber === flight.flight.iata
                                                            ? 'bg-white/20'
                                                            : flight.flight_status === 'cancelled'
                                                                ? 'bg-red-50 text-red-600'
                                                                : ((flight.departure?.delay ?? 0) > 15 || flight.flight_status === 'diverted')
                                                                    ? 'bg-orange-50 text-orange-600'
                                                                    : 'bg-forest/10 text-forest'
                                                            }`}>
                                                            {flight.flight_status === 'cancelled'
                                                                ? 'Cancelled'
                                                                : (flight.departure?.delay ?? 0) > 0
                                                                    ? `Delayed ${(flight.departure?.delay ?? 0)}m`
                                                                    : flight.flight_status === 'active'
                                                                        ? 'Live'
                                                                        : 'On Time'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] font-bold opacity-70 uppercase truncate mb-0.5">{flight.airline.name}</p>
                                                    <p className="text-xs font-black">{dayjs(flight.departure.scheduled).format('HH:mm')} → {dayjs(flight.arrival.scheduled).format('HH:mm')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, px: 2 }}>
                                            Select coordinates to see suggested flights.
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 p-6 bg-navy dark:bg-white/5 rounded-[1.5rem] text-white/90 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span>🛡️</span> Safety Tip
                            </h4>
                            <p className="text-[10px] text-offwhite/50 leading-relaxed font-medium">
                                Verified flight numbers help us match you with the right companion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
