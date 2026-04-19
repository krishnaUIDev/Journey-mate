"use client";

import React, { useState, useEffect, use } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import Link from "next/link";
import Image from "next/image";
import { messages } from "../../../../i18n/messages";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { LocaleSelector } from "../../../../components/LocaleSelector";
import { UserButton, Show } from "@clerk/nextjs";

type Locale = keyof typeof messages;

interface Activity {
    time: string;
    description: string;
    category: "food" | "transport" | "sightseeing" | "leisure";
}

interface Day {
    date: string;
    activities: Activity[];
}

interface Expense {
    item: string;
    amount: number;
    category: "flights" | "hotels" | "food" | "activities" | "other";
}

const MOCK_DETAILS: Record<string, any> = {
    "trip-1": {
        destination: "Paris, France",
        date: "June 15 - June 22, 2024",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        budget: "$1,200",
        stats: {
            spent: 450,
            remaining: 750,
            companions: 3
        },
        itinerary: [
            {
                date: "June 15",
                activities: [
                    { time: "09:00 AM", description: "Arrival at CDG Airport", category: "transport" },
                    { time: "12:30 PM", description: "Lunch at Le Procope", category: "food" },
                    { time: "03:00 PM", description: "Check-in at Hotel", category: "leisure" },
                    { time: "07:00 PM", description: "Eiffel Tower Sunset", category: "sightseeing" }
                ]
            },
            {
                date: "June 16",
                activities: [
                    { time: "10:00 AM", description: "Louvre Museum Tour", category: "sightseeing" },
                    { time: "01:00 PM", description: "Seine River Walk", category: "leisure" },
                    { time: "08:00 PM", description: "Dinner in Montmartre", category: "food" }
                ]
            }
        ],
        expenses: [
            { item: "Flight Tickets", amount: 600, category: "flights" },
            { item: "Hotel - 7 Nights", amount: 800, category: "hotels" },
            { item: "Museum Pass", amount: 150, category: "activities" }
        ],
        mates: [
            { name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
            { name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" }
        ]
    },
    // Add more mock data for trip-2 and trip-3 as needed
};

// Default fallback data for new trips
const FALLBACK_DETAIL = {
    destination: "Unknown Destination",
    date: "Date TBD",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop",
    budget: "$0",
    stats: { spent: 0, remaining: 0, companions: 1 },
    itinerary: [],
    expenses: [],
    mates: []
};

export default function TripDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");

    const trip = MOCK_DETAILS[id] || FALLBACK_DETAIL;

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === "dark") document.documentElement.classList.add("dark");
        }
        if (savedLocale) setLocale(savedLocale);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        document.documentElement.classList.toggle("dark");
    };

    const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value as Locale;
        setLocale(nextLocale);
        localStorage.setItem("locale", nextLocale);
    };

    return (
        <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
            <div className="min-h-screen bg-gray-50 dark:bg-deep-navy font-sans transition-colors duration-300">
                {/* Unified Nav */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm">
                    <Link href="/dashboard" className="flex items-center gap-4 group">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 group-hover:bg-navy dark:group-hover:bg-sand transition-all">
                            <svg className="w-4 h-4 text-navy dark:text-offwhite group-hover:text-white dark:group-hover:text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </div>
                        <span className="font-bold text-navy dark:text-offwhite"><FormattedMessage id="dashboard.title" /></span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </div>
                </nav>

                {/* Hero Header */}
                <div className="relative h-80 w-full overflow-hidden">
                    <Image
                        src={trip.image}
                        alt={trip.destination}
                        fill
                        className="object-cover brightness-75"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-10 left-12">
                        <h1 className="text-5xl font-black text-white mb-2 leading-tight">{trip.destination}</h1>
                        <p className="text-xl text-white/80 font-medium">{trip.date}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content: Itinerary */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-navy dark:text-offwhite mb-8">Itinerary</h2>
                            <div className="space-y-10 border-l-2 border-gray-200 dark:border-white/10 ml-4 pl-8">
                                {trip.itinerary.map((day: any, idx: number) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-forest dark:bg-sand border-4 border-white dark:border-deep-navy shadow-sm" />
                                        <h3 className="text-lg font-bold text-navy dark:text-offwhite mb-4 uppercase tracking-wider text-xs">{day.date}</h3>
                                        <div className="grid gap-4">
                                            {day.activities.map((activity: any, aIdx: number) => (
                                                <div key={aIdx} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex gap-6 hover:shadow-md transition-shadow">
                                                    <span className="text-sm font-bold text-gray-400 w-20 shrink-0">{activity.time}</span>
                                                    <div>
                                                        <p className="text-navy dark:text-offwhite font-bold mb-1">{activity.description}</p>
                                                        <span className="text-[10px] uppercase font-black text-forest/60 dark:text-sand/50 tracking-widest">{activity.category}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar: Budget & Mates */}
                    <div className="space-y-8">
                        {/* Budget Card */}
                        <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/10 shadow-sm">
                            <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-6">Budget Overview</h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center">
                                    <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Total Spent</p>
                                    <p className="text-3xl font-black text-forest dark:text-sand">${trip.stats.spent}</p>
                                </div>
                                <div className="space-y-3">
                                    {trip.expenses.map((expense: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 dark:text-offwhite/60">{expense.item}</span>
                                            <span className="font-bold text-navy dark:text-offwhite">${expense.amount}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between">
                                    <span className="font-bold text-navy dark:text-offwhite">Remaining</span>
                                    <span className="font-black text-navy dark:text-offwhite">${trip.stats.remaining}</span>
                                </div>
                            </div>
                        </div>

                        {/* Travel Mates */}
                        <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/10 shadow-sm">
                            <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-6">Travel Mates</h3>
                            <div className="space-y-4">
                                {trip.mates.map((mate: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-white/10">
                                            <Image src={mate.avatar} alt={mate.name} fill className="object-cover" />
                                        </div>
                                        <span className="font-bold text-navy dark:text-offwhite">{mate.name}</span>
                                    </div>
                                ))}
                                <button className="w-full mt-4 py-2 text-xs font-black uppercase text-navy/40 dark:text-offwhite/40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl hover:border-navy transition-colors">
                                    + Invite Mate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </IntlProvider>
    );
}
