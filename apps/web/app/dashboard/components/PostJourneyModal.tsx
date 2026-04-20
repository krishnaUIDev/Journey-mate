import React, { useState, useEffect } from "react";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Box, Typography, TextField } from "@mui/material";

export function PostJourneyModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [description, setDescription] = useState("");

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-post-trip', handleOpen);
        return () => window.removeEventListener('open-post-trip', handleOpen);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Journey Posted! ${from} to ${to} on ${date?.format('YYYY-MM-DD')}.`);
        setIsOpen(false);
        // Reset form
        setFrom("");
        setTo("");
        setDate(dayjs());
        setDescription("");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-navy/60 dark:bg-black/80 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white dark:bg-deep-navy rounded-[3rem] p-12 shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-forest to-sand" />

                <h2 className="text-4xl font-black text-navy dark:text-offwhite mb-2 leading-tight">Post Your Journey</h2>
                <p className="text-gray-500 dark:text-offwhite/50 font-medium mb-10">Share your travel plans to find a companion on your route.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <AirportAutocomplete
                            label="From"
                            placeholder="e.g. HYD"
                            value={from}
                            onChange={setFrom}
                        />
                        <AirportAutocomplete
                            label="To"
                            placeholder="e.g. JFK"
                            value={to}
                            onChange={setTo}
                        />
                    </div>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                            Date of Journey
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

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">A Little About Your Trip</label>
                        <textarea
                            rows={3}
                            placeholder="e.g. Traveling for business, can help with navigation..."
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-2xl text-navy dark:text-offwhite font-medium focus:ring-2 focus:ring-forest/50 outline-none transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-navy dark:text-offwhite font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-navy dark:bg-sand text-white dark:text-navy rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-forest transition-all shadow-lg active:scale-95"
                        >
                            Post Journey
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
