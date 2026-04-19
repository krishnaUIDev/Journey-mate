"use client";

import React from "react";
import { FormattedMessage } from "react-intl";
import { TripCard } from "@repo/ui/trip-card";

export function TravelerView() {
    return (
        <div className="max-w-7xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-navy dark:text-offwhite mb-4">
                        Find a Companion
                    </h1>
                    <p className="text-gray-500 dark:text-offwhite/50 text-lg font-medium">
                        Search by flight route and date to find your perfect travel mate.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-2 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 w-full md:w-auto">
                    <div className="px-4 py-2 border-r border-gray-100 dark:border-white/10 shrink-0">
                        <span className="block text-[10px] uppercase font-black text-gray-400 mb-1">Flight Route</span>
                        <input type="text" placeholder="e.g. JFK to LHR" className="bg-transparent border-none text-navy dark:text-offwhite font-bold p-0 focus:ring-0 text-sm" />
                    </div>
                    <div className="px-4 py-2 shrink-0">
                        <span className="block text-[10px] uppercase font-black text-gray-400 mb-1">Date</span>
                        <input type="date" className="bg-transparent border-none text-navy dark:text-offwhite font-bold p-0 focus:ring-0 text-sm" />
                    </div>
                    <button className="bg-navy dark:bg-sand text-white dark:text-navy px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                        Search
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Profile Summary & Needs Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-forest/5 dark:bg-sand/5 -mr-10 -mt-10 rounded-full group-hover:scale-125 transition-transform duration-700" />
                        <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-6">Travel Needs</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">♿</div>
                                <span className="text-sm font-bold text-navy dark:text-offwhite">Wheelchair Assistance</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">💊</div>
                                <span className="text-sm font-bold text-navy dark:text-offwhite">Medical Reminders</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">🗣️</div>
                                <span className="text-sm font-bold text-navy dark:text-offwhite">Hindi, English</span>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-3 text-xs font-black uppercase text-navy dark:text-white dark:bg-white/10 bg-gray-100 rounded-xl hover:bg-forest hover:text-white transition-all">
                            Update Needs
                        </button>
                    </div>

                    <div className="p-8 bg-forest dark:bg-sand border-none rounded-3xl text-white dark:text-navy shadow-lg shadow-forest/20 group">
                        <p className="text-xs uppercase font-black tracking-widest opacity-60 mb-2">Upcoming Reminder</p>
                        <h4 className="text-lg font-bold mb-4">Flight to London in 3 days!</h4>
                        <p className="text-sm opacity-80 mb-6">Your companion "Sarah" has confirmed she will meet you at the terminal entrance.</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black uppercase transition-all backdrop-blur-md">
                            View Details
                        </button>
                    </div>
                </div>

                {/* Companion Recommendations */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-navy dark:text-offwhite">Verified Companions</h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">Top Rated</span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">Available</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group flex gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-forest/20">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-navy dark:text-offwhite text-lg">Sarah Jenkins</h3>
                                    <span className="text-forest dark:text-sand font-black text-sm">★ 4.9</span>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">RN Nurse • Bilingual</p>
                                <div className="flex gap-2 mb-6 flex-wrap">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold">First Aid</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold">LHR Route</span>
                                </div>
                                <button className="w-full py-3 bg-gray-50 dark:bg-white/10 hover:bg-navy hover:text-white dark:hover:bg-sand dark:hover:text-navy rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    View Profile & Chat
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group flex gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-forest/20">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="Michael" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-navy dark:text-offwhite text-lg">Michael Chen</h3>
                                    <span className="text-forest dark:text-sand font-black text-sm">★ 5.0</span>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Ex-Airline Crew</p>
                                <div className="flex gap-2 mb-6 flex-wrap">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold">Wheelchair Pro</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold">Mandarin</span>
                                </div>
                                <button className="w-full py-3 bg-gray-50 dark:bg-white/10 hover:bg-navy hover:text-white dark:hover:bg-sand dark:hover:text-navy rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    View Profile & Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
