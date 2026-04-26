"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Place as PlaceIcon,
    AccessTime as TimeIcon,
    Event as EventIcon,
    Fastfood as FoodIcon,
    FlightTakeoff as FlightIcon,
    DirectionsRun as ActivityIcon,
    AutoFixHigh as MagicIcon
} from '@mui/icons-material';
import { Tooltip, CircularProgress as TinyProgress } from '@mui/material';
import dayjs from 'dayjs';
import { addItineraryItem, getJourneyItinerary, deleteItineraryItem } from '../../actions/itinerary';
import { supabase } from '../../../lib/supabase';

interface ItineraryItem {
    id: string;
    title: string;
    description?: string;
    type: 'meetup' | 'activity' | 'layover' | 'food' | 'transport';
    start_time?: string;
    location?: string;
    created_by: string;
}

interface ItineraryTimelineProps {
    journeyId: string;
    userId: string;
    isCompanion: boolean;
}

export function ItineraryTimeline({ journeyId, userId, isCompanion }: ItineraryTimelineProps) {
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New item form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<ItineraryItem['type']>('activity');
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAISuggest = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const suggestions: Record<string, string[]> = {
                'meetup': ["Quick coffee at Gate B", "Final group meetup", "Exchange contact info", "Trip debrief"],
                'food': ["Grab some dinner", "Local snack hunt", "Quick breakfast", "Explore the food court"],
                'activity': ["Duty free shopping", "Explore the terminal", "Stretch and walk", "Catch up on work"],
                'transport': ["Head to boarding gate", "Train to next terminal", "Find the lounge", "Check gate status"],
                'layover': ["Relax at the lounge", "Quick nap", "Charge devices", "Read a book"]
            };
            const list = (suggestions[type as keyof typeof suggestions] || suggestions['activity']) as string[];
            setTitle(list[Math.floor(Math.random() * list.length)] || "");
            setIsGenerating(false);
        }, 500);
    };

    useEffect(() => {
        const fetchItinerary = async () => {
            const data = await getJourneyItinerary(journeyId);
            setItems(data);
            setLoading(false);
        };

        fetchItinerary();

        // Real-time subscription
        if (!supabase) return;
        const channel = supabase
            .channel(`itinerary-${journeyId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'journey_itinerary',
                filter: `journey_id=eq.${journeyId}`
            }, () => {
                fetchItinerary();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [journeyId]);

    const handleAddItem = async () => {
        if (!title) return;
        setSubmitting(true);
        try {
            let formattedTime = undefined;
            if (time) {
                const [hours, minutes] = time.split(':');
                formattedTime = dayjs().hour(parseInt(hours || '0')).minute(parseInt(minutes || '0')).second(0).toISOString();
            }

            await addItineraryItem({
                journey_id: journeyId,
                title,
                description,
                type,
                start_time: formattedTime,
                location: location || undefined,
                created_by: userId
            });
            setOpen(false);
            // Reset form
            setTitle("");
            setDescription("");
            setType('activity');
            setTime("");
            setLocation("");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItineraryItem(id);
        } catch (error) {
            console.error(error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'meetup': return <EventIcon sx={{ fontSize: 20 }} />;
            case 'food': return <FoodIcon sx={{ fontSize: 20 }} />;
            case 'transport': return <FlightIcon sx={{ fontSize: 20 }} />;
            case 'activity': return <ActivityIcon sx={{ fontSize: 20 }} />;
            default: return <EventIcon sx={{ fontSize: 20 }} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'meetup': return 'bg-emerald-500';
            case 'food': return 'bg-amber-500';
            case 'transport': return 'bg-blue-500';
            case 'activity': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>;

    return (
        <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'slate.500', letterSpacing: '0.1em' }}>
                    GROUP ITINERARY
                </Typography>
                {isCompanion && (
                    <Button
                        variant="contained"
                        onClick={() => setOpen(true)}
                        sx={{
                            borderRadius: '2rem',
                            fontWeight: 900,
                            textTransform: 'none',
                            bgcolor: '#3B82F6',
                            px: 2,
                            py: 0.5,
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: '#2563EB',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                            },
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center'
                        }}
                    >
                        <AddIcon sx={{ fontSize: 16 }} />
                        <Typography variant="button" sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                            Add Activity
                        </Typography>
                    </Button>
                )}
            </Box>

            {items.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '2rem', border: '2px dashed rgba(0,0,0,0.05)', '.dark &': { bgcolor: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)' } }}>
                    <Typography sx={{ color: 'slate.400', fontWeight: 700 }}>No activities planned yet.</Typography>
                    {isCompanion && <Typography variant="caption" sx={{ color: 'slate.400' }}>Collaborate with your companions by adding one!</Typography>}
                </Box>
            ) : (
                <div className="space-y-6 relative ml-4 border-l-2 border-slate-100 dark:border-slate-800 pb-4">
                    {items.map((item, idx) => (
                        <div key={item.id} className="relative pl-8 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            {/* Marker */}
                            <div className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${getTypeColor(item.type)} top-2 z-10`} />

                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl text-white ${getTypeColor(item.type)}`}>
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div>
                                            <Typography sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'white' }, lineHeight: 1.2 }}>
                                                {item.title}
                                            </Typography>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <span className="uppercase">{item.type}</span>
                                                </Typography>
                                                {item.start_time && (
                                                    <Typography variant="caption" sx={{ color: 'emerald.600', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <TimeIcon sx={{ fontSize: 12 }} />
                                                        {dayjs(item.start_time).format('hh:mm A')}
                                                    </Typography>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isCompanion && item.created_by === userId && (
                                        <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ opacity: 0, groupHover: { opacity: 1 }, transition: 'opacity 0.2s', color: 'error.main' }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </div>
                                {item.description && (
                                    <Typography variant="body2" sx={{ color: 'slate.600', '.dark &': { color: 'slate.400' }, mt: 1.5, lineHeight: 1.6, fontWeight: 500 }}>
                                        {item.description}
                                    </Typography>
                                )}
                                {item.location && (
                                    <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg w-fit">
                                        <PlaceIcon sx={{ fontSize: 14, color: 'slate.400' }} />
                                        <Typography sx={{ fontSize: '10px', color: 'slate.500', fontWeight: 800 }}>{item.location}</Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Item Modal */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '2rem', p: 1, width: '100%', maxWidth: 450, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>Plan Activity</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="What's the plan?"
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Coffee at Terminal 3"
                            slotProps={{
                                input: {
                                    sx: { borderRadius: '1rem', pr: 6 },
                                    endAdornment: (
                                        <Tooltip title="AI Suggest">
                                            <IconButton
                                                size="small"
                                                onClick={handleAISuggest}
                                                disabled={isGenerating}
                                                sx={{ color: '#0ea5e9' }}
                                            >
                                                {isGenerating ? <TinyProgress size={18} color="inherit" /> : <MagicIcon sx={{ fontSize: 20 }} />}
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                            }}
                        />
                        <TextField
                            label="Additional Notes (Optional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={type}
                                    label="Type"
                                    onChange={(e) => setType(e.target.value as any)}
                                    sx={{ borderRadius: '1rem' }}
                                >
                                    <MenuItem value="meetup">Meetup</MenuItem>
                                    <MenuItem value="food">Food & Drink</MenuItem>
                                    <MenuItem value="activity">Activity</MenuItem>
                                    <MenuItem value="transport">Transport</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                type="time"
                                label="Time (Optional)"
                                fullWidth
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: { sx: { borderRadius: '1rem' } }
                                }}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <TextField
                            label="Location (Optional)"
                            fullWidth
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Near Gate B12"
                            slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 900, color: 'slate.500' }}>Cancel</Button>
                    <Button
                        onClick={handleAddItem}
                        disabled={!title || submitting}
                        variant="contained"
                        sx={{
                            borderRadius: '1rem',
                            fontWeight: 900,
                            px: 4,
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' }
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : "Save to Timeline"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
