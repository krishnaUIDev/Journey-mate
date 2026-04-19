"use client";

import React, { useState, useEffect } from "react";
import { TripCard } from "@repo/ui";
import { UserButton, Show } from "@clerk/nextjs";
import { IntlProvider, FormattedMessage } from "react-intl";
import Link from "next/link";
import { messages } from "../../i18n/messages";
import { TripCreationModal } from "../../components/TripCreationModal";
import Image from "next/image";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LocaleSelector } from "../../components/LocaleSelector";

type Locale = keyof typeof messages;

const MOCK_TRIPS = [
    {
        id: "trip-1",
        destination: "Paris, France",
        date: "June 15 - June 22, 2024",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        budget: "$1,200",
        description: "Experience the city of lights! Planning to visit the Eiffel Tower, Louvre, and charming cafes in Montmartre.",
    },
    {
        id: "trip-2",
        destination: "Bali, Indonesia",
        date: "July 10 - July 25, 2024",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
        budget: "$800",
        description: "Relaxing getaway in Ubud and Seminyak. Yoga retreats, beach clubs, and exploring tropical rainforests.",
    },
    {
        id: "trip-3",
        destination: "Tokyo, Japan",
        date: "September 5 - September 15, 2024",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        budget: "$2,500",
        description: "Technological marvels and ancient temples. Sushi tours, Akihabara exploration, and Mt. Fuji day trip.",
    },
];

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trips, setTrips] = useState(MOCK_TRIPS);

    useEffect(() => {
        // Theme initialization
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initialTheme = savedTheme || systemTheme;
        setTheme(initialTheme);
        if (initialTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Locale initialization
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedLocale && messages[savedLocale]) {
            setLocale(savedLocale);
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        if (nextTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value as Locale;
        setLocale(nextLocale);
        localStorage.setItem("locale", nextLocale);
    };

    const filteredTrips = trips.filter((trip) =>
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateTrip = (newTrip: any) => {
        const tripWithMeta = {
            ...newTrip,
            id: `trip-${Date.now()}`,
            image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop",
            date: `${newTrip.startDate} - ${newTrip.endDate}`
        };
        setTrips([tripWithMeta, ...trips]);
    };

    return (
        <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
            <div className="min-h-screen bg-gray-50 dark:bg-deep-navy font-sans transition-colors duration-300">
                {/* Sidebar / Top Nav */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm">
                    {/* Brand Logo & Name */}
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="Journey-mate Logo"
                                fill
                                className="object-contain dark:brightness-200 dark:contrast-150"
                            />
                        </div>
                        <span
                            className="text-xl font-bold text-navy dark:text-offwhite tracking-tight"
                            style={{
                                textShadow: theme === "light"
                                    ? "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 1px 2px rgba(0,0,0,0.2)"
                                    : "0 1px 0 #222, 0 2px 0 #1a1a1a, 0 3px 0 #111, 0 1px 2px rgba(0,0,0,0.5)"
                            }}
                        >
                            Journey<span className="text-forest dark:text-sand/80 text-xl font-bold">-mate</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder={messages[locale]["dashboard.search"] as string}
                                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 border-none text-sm focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg
                                className="absolute left-3 top-2.5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-navy dark:bg-sand text-white dark:text-navy px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <FormattedMessage id="dashboard.newTrip" />
                            </button>

                            <Show when="signed-in">
                                <UserButton />
                            </Show>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-8 py-12">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-navy dark:text-offwhite mb-2">
                                <FormattedMessage id="dashboard.title" />
                            </h1>
                            <p className="text-gray-500 dark:text-offwhite/50">
                                <FormattedMessage id="dashboard.subtitle" />
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium">
                                <FormattedMessage id="dashboard.upcoming" />
                            </button>
                            <button className="px-4 py-2 rounded-lg text-gray-500 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5">
                                <FormattedMessage id="dashboard.past" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                {...trip}
                                href={`/dashboard/trips/${trip.id}`}
                            />
                        ))}
                    </div>

                    {filteredTrips.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-400">
                                <FormattedMessage
                                    id="dashboard.noTrips"
                                    values={{ searchTerm }}
                                />
                            </p>
                        </div>
                    )}
                </main>

                <TripCreationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onFinish={handleCreateTrip}
                />
            </div>
        </IntlProvider>
    );
}
