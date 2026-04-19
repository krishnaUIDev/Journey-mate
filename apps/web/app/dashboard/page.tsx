"use client";

import React, { useState } from "react";
import { TripCard } from "@repo/ui";
import { UserButton, Show } from "@clerk/nextjs";

const MOCK_TRIPS = [
    {
        destination: "Paris, France",
        date: "June 15 - June 22, 2024",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        budget: "$1,200",
        description: "Experience the city of lights! Planning to visit the Eiffel Tower, Louvre, and charming cafes in Montmartre.",
    },
    {
        destination: "Bali, Indonesia",
        date: "July 10 - July 25, 2024",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
        budget: "$800",
        description: "Relaxing getaway in Ubud and Seminyak. Yoga retreats, beach clubs, and exploring tropical rainforests.",
    },
    {
        destination: "Tokyo, Japan",
        date: "September 5 - September 15, 2024",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        budget: "$2,500",
        description: "Technological marvels and ancient temples. Sushi tours, Akihabara exploration, and Mt. Fuji day trip.",
    },
];

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTrips = MOCK_TRIPS.filter((trip) =>
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-deep-navy font-sans">
            {/* Sidebar / Top Nav */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                <div className="text-xl font-bold tracking-tight text-navy dark:text-offwhite">
                    Journey<span className="text-forest dark:text-sand/80">-mate</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search destinations..."
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
                    <button className="bg-navy dark:bg-sand text-white dark:text-navy px-6 py-2 rounded-full font-bold text-sm">
                        + New Trip
                    </button>
                    <Show when="signed-in">
                        <UserButton />
                    </Show>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-navy dark:text-offwhite mb-2">My Journeys</h1>
                        <p className="text-gray-500 dark:text-offwhite/50">Manage and plan your upcoming adventures.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium">
                            Upcoming
                        </button>
                        <button className="px-4 py-2 rounded-lg text-gray-500 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5">
                            Past
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTrips.map((trip) => (
                        <TripCard key={trip.destination} {...trip} />
                    ))}
                </div>

                {filteredTrips.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No trips found for "{searchTerm}"</p>
                    </div>
                )}
            </main>
        </div>
    );
}
