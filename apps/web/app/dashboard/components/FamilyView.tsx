"use client";

import React from "react";
import { FormattedMessage } from "react-intl";

export function FamilyView() {
    return (
        <div className="max-w-7xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl font-black text-navy dark:text-offwhite mb-4">Family Tracking</h1>
            <p className="text-gray-500 dark:text-offwhite/50 text-lg font-medium mb-12">
                Monitor your family members' journeys and manage companion approvals.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Active Trip Tracker */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-navy dark:text-offwhite mb-8">Active Journey: Mom's Trip to London</h2>
                        <div className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-xs uppercase font-black text-gray-400 tracking-widest mb-1">Flight Number</p>
                                    <p className="text-xl font-bold text-navy dark:text-offwhite">BA212</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase font-black text-gray-400 tracking-widest mb-1">Arrival Status</p>
                                    <p className="text-xl font-bold text-forest dark:text-sand">On Time</p>
                                </div>
                            </div>

                            {/* Milestone Tracker */}
                            <div className="relative pt-12 pb-8">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-white/5 -translate-y-1/2 rounded-full" />
                                <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-forest dark:bg-sand -translate-y-1/2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]" />

                                <div className="relative flex justify-between">
                                    <div className="text-center group">
                                        <div className="w-10 h-10 rounded-full bg-forest text-white dark:bg-sand dark:text-navy flex items-center justify-center font-bold mb-3 shadow-lg relative z-10 transition-transform group-hover:scale-110">✓</div>
                                        <p className="text-[10px] uppercase font-black text-navy dark:text-offwhite tracking-tighter">Check-in</p>
                                    </div>
                                    <div className="text-center group">
                                        <div className="w-10 h-10 rounded-full bg-forest text-white dark:bg-sand dark:text-navy flex items-center justify-center font-bold mb-3 shadow-lg relative z-10 transition-transform group-hover:scale-110">✓</div>
                                        <p className="text-[10px] uppercase font-black text-navy dark:text-offwhite tracking-tighter">Boarding</p>
                                    </div>
                                    <div className="text-center group">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-deep-navy border-4 border-forest dark:border-sand flex items-center justify-center font-bold mb-3 shadow-lg relative z-10 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-forest dark:bg-sand" />
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-navy dark:text-offwhite tracking-tighter">In Flight</p>
                                    </div>
                                    <div className="text-center group opacity-40">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold mb-3 relative z-10">4</div>
                                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-tighter">Landed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-forest/20">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-400">Companion</p>
                                        <p className="font-bold text-navy dark:text-offwhite">Sarah Jenkins</p>
                                    </div>
                                </div>
                                <button className="px-6 py-2 bg-navy dark:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-forest transition-all">
                                    Contact Sarah
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Approvals Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-6">Pending Approvals</h3>
                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10">
                                <p className="text-[10px] font-black uppercase text-forest dark:text-sand tracking-widest mb-3">Dad's Trip: Mumbai</p>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Raj" alt="Raj" className="w-full h-full" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-navy dark:text-offwhite">Rajesh Kumar</p>
                                        <p className="text-xs text-gray-500">★ 4.8 • Ex-Armed Forces</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2.5 bg-forest dark:bg-sand text-white dark:text-navy rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        Approve
                                    </button>
                                    <button className="px-4 py-2.5 bg-gray-200 dark:bg-white/10 text-gray-500 rounded-xl text-[10px] font-black uppercase">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-navy text-white rounded-3xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold mb-2">Milestone Alerts</h4>
                        <p className="text-xs opacity-70 mb-6 leading-relaxed">We'll send you an SMS and Email at every key moment of your family member's journey.</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">📱</div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">📧</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
