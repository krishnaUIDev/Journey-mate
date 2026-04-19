"use client";

import React, { useState, useEffect } from "react";

export function PostJourneyModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-post-trip', handleOpen);
        return () => window.removeEventListener('open-post-trip', handleOpen);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Journey Posted! ${from} to ${to} on ${date}.`);
        setIsOpen(false);
        // Reset form
        setFrom("");
        setTo("");
        setDate("");
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
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">From</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. HYD"
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-2xl text-navy dark:text-offwhite font-bold focus:ring-2 focus:ring-forest/50 outline-none transition-all"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">To</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. JFK"
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-2xl text-navy dark:text-offwhite font-bold focus:ring-2 focus:ring-forest/50 outline-none transition-all"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-2">Date of Journey</label>
                        <input
                            required
                            type="date"
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-2xl text-navy dark:text-offwhite font-bold focus:ring-2 focus:ring-forest/50 outline-none transition-all"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

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
