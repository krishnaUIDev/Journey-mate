import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography } from "@mui/material";
import { useJourneys, JourneyPost } from "../../../context/JourneysContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function JourneyFeed() {
    const { journeys, loading, error } = useJourneys();
    const router = useRouter();
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchDate, setSearchDate] = useState<Dayjs | null>(dayjs());
    const [filteredJourneys, setFilteredJourneys] = useState<JourneyPost[]>([]);

    useEffect(() => {
        if (!loading) {
            setFilteredJourneys(journeys);
        }
    }, [journeys, loading]);

    const handleSearch = () => {
        const results = journeys.filter((journey: JourneyPost) => {
            const matchFrom = !searchFrom || journey.from.toLowerCase().includes(searchFrom.toLowerCase());
            const matchTo = !searchTo || journey.to.toLowerCase().includes(searchTo.toLowerCase());
            const matchDate = !searchDate || journey.date === searchDate.format('YYYY-MM-DD');
            return matchFrom && matchTo && matchDate;
        });
        setFilteredJourneys(results);
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Marketplace Header */}
            <div className="text-center mb-16">
                <h1 className="text-6xl font-black text-navy dark:text-offwhite mb-6">
                    Travel Together, <span className="text-forest dark:text-sand">Safely</span>
                </h1>
                <p className="text-gray-500 dark:text-offwhite/50 text-xl font-medium max-w-2xl mx-auto">
                    The world's largest community for travel companions. Pair up with verified members on your flight.
                </p>
            </div>

            {/* Advanced Search Bar */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 mb-16 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 flex gap-4 w-full">
                    <AirportAutocomplete
                        label="Coming From"
                        placeholder="e.g. HYD"
                        value={searchFrom}
                        onChange={setSearchFrom}
                    />
                    <AirportAutocomplete
                        label="Going To"
                        placeholder="e.g. JFK"
                        value={searchTo}
                        onChange={setSearchTo}
                    />
                </div>
                <Box className="w-full lg:w-56" sx={{ px: 2 }}>
                    <Typography variant="caption" sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        fontWeight: 900,
                        color: 'text.secondary',
                        mb: 0.5,
                        ml: 1,
                        fontSize: '10px',
                        letterSpacing: '0.05em'
                    }}>
                        On Date
                    </Typography>
                    <DatePicker
                        value={searchDate}
                        onChange={(newValue) => setSearchDate(newValue)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                variant: 'standard',
                                slotProps: {
                                    input: {
                                        disableUnderline: true,
                                        sx: {
                                            px: 3,
                                            py: 1.2,
                                            bgcolor: 'rgba(0,0,0,0.03)',
                                            '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                            borderRadius: '1rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            border: '1px solid transparent',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                                '.dark &': { bgcolor: 'rgba(255,255,255,0.05)' },
                                            },
                                            '&.Mui-focused': {
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)',
                                            }
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </Box>
                <button
                    onClick={handleSearch}
                    className="w-full lg:w-auto bg-navy dark:bg-sand text-white dark:text-navy px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-forest transition-all shadow-lg active:scale-95"
                >
                    Find Companions
                </button>
            </div>

            {/* Journeys List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-white/5 rounded-[2.5rem] h-[500px] animate-pulse border border-gray-100 dark:border-white/10" />
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
                        <Typography color="error" variant="h6" sx={{ fontWeight: 'bold' }}>Error loading journeys</Typography>
                        <p className="text-gray-500 mt-2">{error}</p>
                    </div>
                ) : filteredJourneys.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                        <Typography variant="h4" className="text-navy dark:text-offwhite" sx={{ fontWeight: 'black', mb: 2 }}>No journeys found</Typography>
                        <p className="text-gray-500 mb-10 max-w-md mx-auto font-medium text-lg">Be the first to share your trip and connect with others on your route.</p>
                        <Link
                            href="/dashboard/post"
                            className="inline-block bg-navy dark:bg-sand text-white dark:text-navy px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-forest transition-all shadow-xl active:scale-95"
                        >
                            Post Your Trip Now
                        </Link>
                    </div>
                ) : (
                    filteredJourneys.map((journey) => (
                        <div
                            key={journey.id}
                            onClick={() => router.push(`/dashboard/journey/${journey.id}`)}
                            className="bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all group flex flex-col cursor-pointer active:scale-[0.98]"
                        >
                            {/* Route Header */}
                            <div className="bg-gray-50 dark:bg-white/5 p-8 border-b border-gray-100 dark:border-white/10 relative">
                                <div className="absolute top-4 right-4 bg-forest/10 dark:bg-sand/10 text-forest dark:text-sand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Upcoming
                                </div>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-navy dark:text-offwhite">{journey.from}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Origin</p>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center gap-1 opacity-20">
                                        <div className="h-0.5 w-full bg-navy dark:bg-offwhite rounded-full relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-navy dark:border-offwhite w-1.5 h-1.5" />
                                        </div>
                                        <span className="text-[8px] font-black">NONSTOP</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-navy dark:text-offwhite">{journey.to}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
                                    </div>
                                </div>
                                <p className="text-center text-xs font-bold text-gray-400 mt-4">{journey.date}</p>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-forest/20">
                                        <img src={journey.user.avatar} alt={journey.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-navy dark:text-offwhite">{journey.user.name}</h3>
                                            {journey.user.verified && <span className="text-blue-500 text-[10px] opacity-80">🛡️</span>}
                                        </div>
                                        <p className="text-[10px] font-black text-forest dark:text-sand uppercase tracking-widest">★ {journey.user.rating.toFixed(1)} / 5.0</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-offwhite/60 mb-8 line-clamp-3 italic leading-relaxed">
                                    "{journey.description}"
                                </p>

                                <div className="flex gap-2 mb-8 flex-wrap">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    className="w-full mt-auto py-4 bg-gray-100 dark:bg-white/10 hover:bg-forest hover:text-white dark:hover:bg-sand dark:hover:text-navy text-navy dark:text-offwhite rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/journey/${journey.id}`);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
