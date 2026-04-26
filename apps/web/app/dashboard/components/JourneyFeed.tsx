import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import Image from "next/image";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as ResetIcon,
    Verified as VerifiedIcon
} from "@mui/icons-material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useJourneys, JourneyPost } from "../../../context/JourneysContext";
import { ProfileBadge } from "./ProfileBadge";
import { useMessages } from "../../../context/MessagesContext";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { EditJourneyModal } from "./EditJourneyModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export function JourneyFeed() {
    const { journeys, loading, error, deleteJourney } = useJourneys();
    const { myRequests } = useMessages();
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

    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        if (!loading) {
            const visible = (journeys || []).filter(j => j.status !== 'completed' && j.status !== 'cancelled');
            const sorted = [...visible].sort((a, b) =>
                dayjs(b.date).unix() - dayjs(a.date).unix()
            );
            setFilteredJourneys(sorted);
        }
    }, [journeys, loading]);

    const handleSearch = () => {
        const results = (journeys || []).filter((journey: JourneyPost) => {
            if (!journey) return false;
            // Filter out completed/cancelled unless explicitly searched (though typically feed is for upcoming)
            if (journey.status === 'completed' || journey.status === 'cancelled') return false;

            const matchFrom = !searchFrom || (journey.origin || "").toLowerCase().includes(searchFrom.toLowerCase());
            const matchTo = !searchTo || (journey.destination || "").toLowerCase().includes(searchTo.toLowerCase());
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Marketplace Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-5xl font-black text-navy dark:text-offwhite mb-4">
                    Travel Together, <span className="text-forest dark:text-sand">Safely</span>
                </h1>
                <p className="text-gray-600 dark:text-offwhite/60 text-lg font-medium max-w-2xl mx-auto">
                    The world's largest community for travel companions. Pair up with verified members on your flight.
                </p>
            </div>

            {/* Advanced Search Bar */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 mb-12 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
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
                        aria-label="Find Companions"
                        className="w-full lg:w-auto bg-navy dark:bg-sand text-white dark:text-navy px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-forest transition-all shadow-lg active:scale-95"
                    >
                        Find Companions
                    </button>
                    {(searchFrom || searchTo || (searchDate && !searchDate.isSame(dayjs(), 'day'))) && (
                        <button
                            onClick={handleReset}
                            aria-label="Reset Search"
                            className="w-full lg:w-auto bg-gray-100 dark:bg-white/10 text-navy dark:text-offwhite px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ResetIcon sx={{ fontSize: 20 }} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Journeys List */}
            <h2 className="sr-only">Available Journeys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-white/5 rounded-[1.5rem] h-[160px] animate-pulse border border-gray-100 dark:border-white/10" />
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
                    filteredJourneys.slice(0, visibleCount).map((journey) => {
                        const isPast = dayjs(journey.date).isBefore(dayjs(), 'day');
                        const isOwner = user?.id === journey.user_id;

                        return (
                            <div
                                key={journey.id}
                                onClick={() => router.push(`/dashboard/journey/${journey.id}`)}
                                className={`bg-white dark:bg-white/5 rounded-[1.25rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98] relative flex items-center p-3 gap-3 ${isPast ? 'opacity-80 grayscale-[0.2]' : ''}`}
                            >
                                {/* Header / Route Icon - More Compact */}
                                {(() => {
                                    const fromCity = journey.origin.split(' (')[0];
                                    const fromCode = journey.origin.match(/\(([^)]+)\)/)?.[1] || journey.origin.slice(0, 3).toUpperCase();
                                    const toCity = journey.destination.split(' (')[0];
                                    const toCode = journey.destination.match(/\(([^)]+)\)/)?.[1] || journey.destination.slice(0, 3).toUpperCase();
                                    return (
                                        <div className="flex-shrink-0 w-12 bg-gray-50 dark:bg-white/5 rounded-xl flex flex-col items-center justify-center border border-gray-100 dark:border-white/10 py-2 gap-0.5">
                                            <Tooltip title={fromCity} placement="left" arrow>
                                                <span className="text-[9px] font-black text-emerald-800 dark:text-sand leading-none cursor-default">{fromCode}</span>
                                            </Tooltip>
                                            <div className="h-px w-4 bg-gray-300 dark:bg-gray-700 my-1 relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-45 border-t border-r border-gray-300 dark:border-gray-700 w-1 h-1" />
                                            </div>
                                            <Tooltip title={toCity} placement="left" arrow>
                                                <span className="text-[9px] font-black text-emerald-900 dark:text-offwhite leading-none cursor-default">{toCode}</span>
                                            </Tooltip>
                                            {journey.layovers && journey.layovers.length > 0 && (
                                                <span className="text-[7px] font-black text-sand-dark dark:text-sand uppercase leading-none mt-1 text-center px-1 truncate w-full text-center">
                                                    {journey.layovers.length === 1 ? `via ${journey.layovers[0]}` : `${journey.layovers.length} stops`}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="flex-1 min-w-0">
                                    {/* Route title + single status pill */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h3 className="font-black text-navy dark:text-white truncate text-sm leading-tight">
                                            {journey.origin.split(' (')[0]} → {journey.destination.split(' (')[0]}
                                        </h3>
                                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${myRequests[journey.id] === 'accepted' ? 'bg-blue-500/10 text-blue-500'
                                            : myRequests[journey.id] === 'pending' ? 'bg-orange-500/10 text-orange-500'
                                                : journey.status === 'ongoing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                                                    : journey.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                        : isPast ? 'bg-slate-100 dark:bg-white/10 text-slate-500'
                                                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            }`}>
                                            {myRequests[journey.id] || (journey.status === 'ongoing' ? 'Live' : journey.status === 'cancelled' ? 'Cancelled' : isPast ? 'Past' : 'Open')}
                                        </span>
                                    </div>

                                    {/* Date + airline row */}
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-2">
                                        <span className="text-gray-500 dark:text-gray-400">{dayjs(journey.date).format('MMM DD')}</span>
                                        {(journey.airline_iata || journey.flight_number) && (
                                            <>
                                                <span>·</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="relative w-3 h-3 flex-shrink-0">
                                                        <Image
                                                            src={`https://www.gstatic.com/flights/airline_logos/70px/${journey.airline_iata || journey.flight_number?.match(/^[A-Z0-9]{2}/)?.[0]}.png`}
                                                            alt=""
                                                            fill
                                                            className="object-contain"
                                                            sizes="12px"
                                                        />
                                                    </div>
                                                    <span className="uppercase tracking-wide">{journey.flight_number || journey.airline_name}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* User row */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                                            <Image
                                                src={journey.user_avatar?.includes('clerk.com') ? `${journey.user_avatar}?height=40&width=40&fit=crop` : journey.user_avatar}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                sizes="20px"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate">{journey.user_name}</span>
                                        {journey.user_rating > 0 && (
                                            <span className="text-[9px] font-black text-amber-500 flex-shrink-0">★ {journey.user_rating.toFixed(1)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions - Compact Context Menu style */}
                                {user?.id === journey.user_id && (
                                    <div className="flex flex-col gap-1 ml-auto">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingJourney(journey);
                                                setIsEditModalOpen(true);
                                            }}
                                            aria-label={`Edit journey from ${journey.origin} to ${journey.destination}`}
                                            sx={{ p: 0.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                                        >
                                            <EditIcon sx={{ fontSize: 14, color: 'gray' }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingJourney(journey);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            aria-label={`Delete journey from ${journey.origin} to ${journey.destination}`}
                                            sx={{ p: 0.5, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                                        >
                                            <DeleteIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                                        </IconButton>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Load More */}
            {!loading && filteredJourneys.length > visibleCount && (
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="bg-navy/5 dark:bg-white/5 text-navy dark:text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-navy hover:text-white dark:hover:bg-sand dark:hover:text-navy transition-all active:scale-95 border border-navy/10 dark:border-white/10"
                    >
                        Load More Trips
                    </button>
                </div>
            )}

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
                    title={`${deletingJourney.origin} to ${deletingJourney.destination}`}
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
