import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as ResetIcon
} from "@mui/icons-material";
import { useJourneys, JourneyPost } from "../../../context/JourneysContext";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { EditJourneyModal } from "./EditJourneyModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export function JourneyFeed() {
    const { journeys, loading, error, deleteJourney } = useJourneys();
    const { user } = useUser();
    const router = useRouter();

    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchDate, setSearchDate] = useState<Dayjs | null>(dayjs());
    const [filteredJourneys, setFilteredJourneys] = useState<JourneyPost[]>([]);

    const [editingJourney, setEditingJourney] = useState<JourneyPost | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [deletingJourney, setDeletingJourney] = useState<JourneyPost | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!loading) {
            const sorted = [...(journeys || [])].sort((a, b) =>
                dayjs(b.date).unix() - dayjs(a.date).unix()
            );
            setFilteredJourneys(sorted);
        }
    }, [journeys, loading]);

    const handleSearch = () => {
        const results = (journeys || []).filter((journey: JourneyPost) => {
            if (!journey) return false;
            const matchFrom = !searchFrom || (journey.from || "").toLowerCase().includes(searchFrom.toLowerCase());
            const matchTo = !searchTo || (journey.to || "").toLowerCase().includes(searchTo.toLowerCase());
            const matchDate = !searchDate || (journey.date || "") === searchDate.format('YYYY-MM-DD');
            return matchFrom && matchTo && matchDate;
        });

        const sortedResults = results.sort((a, b) =>
            dayjs(b.date).unix() - dayjs(a.date).unix()
        );

        setFilteredJourneys(sortedResults);
    };

    const handleReset = () => {
        setSearchFrom("");
        setSearchTo("");
        setSearchDate(dayjs());
        setFilteredJourneys(journeys);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingJourney) return;
        setIsDeleting(true);
        try {
            await deleteJourney(deletingJourney.id);
            setIsDeleteModalOpen(false);
            setDeletingJourney(null);
        } catch (err) {
            console.error("Error deleting journey:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Marketplace Header */}
            <div className="text-center mb-10">
                <h1 className="text-5xl font-black text-navy dark:text-offwhite mb-4">
                    Travel Together, <span className="text-forest dark:text-sand">Safely</span>
                </h1>
                <p className="text-gray-500 dark:text-offwhite/50 text-lg font-medium max-w-2xl mx-auto">
                    The world's largest community for travel companions. Pair up with verified members on your flight.
                </p>
            </div>

            {/* Advanced Search Bar */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 mb-12 flex flex-col lg:flex-row gap-4 items-center">
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
                                            py: 0,
                                            minHeight: '3.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'rgba(0,0,0,0.03)',
                                            '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                            borderRadius: '1.25rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            border: '1px solid transparent',
                                            transition: 'all 0.3s ease',
                                            '& input': {
                                                padding: '0 !important',
                                            },
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
                <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                    <button
                        onClick={handleSearch}
                        className="w-full lg:w-auto bg-navy dark:bg-sand text-white dark:text-navy px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-forest transition-all shadow-lg active:scale-95"
                    >
                        Find Companions
                    </button>
                    {(searchFrom || searchTo || (searchDate && !searchDate.isSame(dayjs(), 'day'))) && (
                        <button
                            onClick={handleReset}
                            className="w-full lg:w-auto bg-gray-100 dark:bg-white/10 text-navy dark:text-offwhite px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ResetIcon sx={{ fontSize: 20 }} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Journeys List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-white/5 rounded-[2.5rem] h-[450px] animate-pulse border border-gray-100 dark:border-white/10" />
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-16 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
                        <Typography color="error" variant="h6" sx={{ fontWeight: 'bold' }}>Error loading journeys</Typography>
                        <p className="text-gray-500 mt-2">{error}</p>
                    </div>
                ) : filteredJourneys.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
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
                    filteredJourneys.map((journey) => {
                        const isPast = dayjs(journey.date).isBefore(dayjs(), 'day');
                        return (
                            <div
                                key={journey.id}
                                onClick={() => router.push(`/dashboard/journey/${journey.id}`)}
                                className={`bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all group flex flex-col cursor-pointer active:scale-[0.98] relative ${isPast ? 'opacity-60 grayscale-[0.3]' : ''}`}
                            >
                                {/* Owner Actions - Floating Floating top-right-ish if owner */}
                                {user?.id === journey.userId && (
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <Tooltip title="Edit Trip">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingJourney(journey);
                                                    setIsEditModalOpen(true);
                                                }}
                                                sx={{
                                                    bgcolor: 'white',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    '&:hover': { bgcolor: '#f8fafc', scale: 1.1 },
                                                    '.dark &': { bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#334155' } }
                                                }}
                                            >
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Trip">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingJourney(journey);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                sx={{
                                                    bgcolor: 'white',
                                                    color: '#ef4444',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    '&:hover': { bgcolor: '#fef2f2', scale: 1.1 },
                                                    '.dark &': { bgcolor: '#1e293b', color: '#f87171', '&:hover': { bgcolor: '#450a0a' } }
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                )}
                                {/* Route Header */}
                                <div className="bg-gray-50 dark:bg-white/5 p-6 border-b border-gray-100 dark:border-white/10 relative">
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPast ? 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400' : 'bg-forest/10 dark:bg-sand/10 text-forest dark:text-sand'}`}>
                                        {isPast ? 'Past Trip' : 'Upcoming'}
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
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
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

                                    <p className="text-sm text-gray-600 dark:text-offwhite/60 mb-4 line-clamp-3 italic leading-relaxed">
                                        "{journey.description}"
                                    </p>

                                    <div className="flex gap-2 mb-6 flex-wrap">
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
                        );
                    })
                )}
            </div>

            {/* Edit Modal */}
            {editingJourney && (
                <EditJourneyModal
                    open={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingJourney(null);
                    }}
                    journey={editingJourney}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingJourney && (
                <DeleteConfirmationModal
                    open={isDeleteModalOpen}
                    title={`${deletingJourney.from} to ${deletingJourney.to}`}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingJourney(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    submitting={isDeleting}
                />
            )}
        </div>
    );
}
