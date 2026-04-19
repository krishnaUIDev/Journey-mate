"use client";

import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

interface JourneyPost {
    id: string;
    from: string;
    to: string;
    date: string;
    user: {
        name: string;
        avatar: string;
        rating: number;
        verified: boolean;
    };
    description: string;
    tags: string[];
}

const MOCK_JOURNEYS: JourneyPost[] = [
    {
        id: "post-1",
        from: "HYD",
        to: "JFK",
        date: "2024-08-15",
        user: {
            name: "Rahul Sharma",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
            rating: 4.8,
            verified: true
        },
        description: "Traveling for study. Can help with luggage and basic assistance. Looking for someone on the same flight.",
        tags: ["Student", "Light Luggage", "English/Hindi"]
    },
    {
        id: "post-2",
        from: "JFK",
        to: "HYD",
        date: "2024-08-20",
        user: {
            name: "Sarah Jenkins",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            rating: 5.0,
            verified: true
        },
        description: "Returning home. Experienced traveler. Happy to help elderly passengers with boarding and navigation.",
        tags: ["Nurse", "Frequent Flyer", "English"]
    },
    {
        id: "post-3",
        from: "LHR",
        to: "DEL",
        date: "2024-09-05",
        user: {
            name: "Anita M.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita",
            rating: 4.9,
            verified: true
        },
        description: "Fluent in Punjabi and English. Traveling with family, happy to pair up for extra safety and companionship.",
        tags: ["Bilingual", "Family Travel"]
    }
];

export function JourneyFeed() {
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [filteredJourneys, setFilteredJourneys] = useState(MOCK_JOURNEYS);

    const handleSearch = () => {
        const results = MOCK_JOURNEYS.filter(journey => {
            const matchFrom = !searchFrom || journey.from.toLowerCase().includes(searchFrom.toLowerCase());
            const matchTo = !searchTo || journey.to.toLowerCase().includes(searchTo.toLowerCase());
            const matchDate = !searchDate || journey.date === searchDate;
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
                    <div className="flex-1 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <span className="block text-[10px] uppercase font-black text-gray-400 mb-1">Coming From</span>
                        <input
                            type="text"
                            placeholder="e.g. HYD"
                            className="bg-transparent border-none text-navy dark:text-offwhite font-bold p-0 focus:outline-none focus:ring-0 text-sm w-full"
                            value={searchFrom}
                            onChange={(e) => setSearchFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <span className="block text-[10px] uppercase font-black text-gray-400 mb-1">Going To</span>
                        <input
                            type="text"
                            placeholder="e.g. JFK"
                            className="bg-transparent border-none text-navy dark:text-offwhite font-bold p-0 focus:outline-none focus:ring-0 text-sm w-full"
                            value={searchTo}
                            onChange={(e) => setSearchTo(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full lg:w-48 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <span className="block text-[10px] uppercase font-black text-gray-400 mb-1">On Date</span>
                    <input
                        type="date"
                        className="bg-transparent border-none text-navy dark:text-offwhite font-bold p-0 focus:outline-none focus:ring-0 text-sm w-full"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="w-full lg:w-auto bg-navy dark:bg-sand text-white dark:text-navy px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-forest transition-all shadow-lg active:scale-95"
                >
                    Find Companions
                </button>
            </div>

            {/* Journeys List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredJourneys.map((journey) => (
                    <div key={journey.id} className="bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
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
                                {journey.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="w-full mt-auto py-4 bg-gray-100 dark:bg-white/10 hover:bg-forest hover:text-white dark:hover:bg-sand dark:hover:text-navy text-navy dark:text-offwhite rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                onClick={() => alert(`Pairing request sent to ${journey.user.name}!`)}
                            >
                                Pair Up Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
