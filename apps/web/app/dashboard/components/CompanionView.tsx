"use client";

import React from "react";
import { FormattedMessage } from "react-intl";

export function CompanionView() {
    return (
        <div className="max-w-7xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl font-black text-navy dark:text-offwhite mb-4">Companion Feed</h1>
            <p className="text-gray-500 dark:text-offwhite/50 text-lg font-medium mb-12">
                Browse travel requests and help fellow travelers on your upcoming routes.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Verification/Training Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-navy dark:text-offwhite">Verification</h3>
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black uppercase text-blue-600">In Progress</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                    <span>Training Progress</span>
                                    <span>75%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-forest dark:bg-sand rounded-full w-[75%]" />
                                </div>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-navy dark:text-offwhite font-medium">
                                    <span className="text-forest">✓</span> Basic First Aid
                                </li>
                                <li className="flex items-center gap-2 text-sm text-navy dark:text-offwhite font-medium">
                                    <span className="text-forest">✓</span> Identity Verified
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Mobility Assistance
                                </li>
                            </ul>
                        </div>

                        <button className="w-full mt-8 py-3 bg-forest dark:bg-sand text-white dark:text-navy rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
                            Resume Training
                        </button>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-black text-navy dark:text-offwhite">12</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Trips Helped</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-forest dark:text-sand">NEW</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Avg Rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Request Feed */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex justify-between items-center bg-white dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="flex gap-4">
                            <button className="px-4 py-2 rounded-xl bg-navy dark:bg-sand text-white dark:text-navy text-xs font-black uppercase tracking-widest">All Requests</button>
                            <button className="px-4 py-2 rounded-xl text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5">My Routes</button>
                        </div>
                        <span className="text-xs font-bold text-gray-400">Showing 24 matches</span>
                    </div>

                    <div className="grid gap-6">
                        {/* Request Card 1 */}
                        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-forest/20">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" alt="Robert" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-1">Robert D.</h3>
                                        <div className="flex gap-4 items-center mb-4">
                                            <span className="text-sm font-bold text-forest dark:text-sand">BOM → LHR</span>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Aug 12, 2024</span>
                                        </div>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black uppercase rounded-lg">Wheelchair</span>
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase rounded-lg">Medical Aid</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px]">
                                    <button className="flex-1 md:flex-none py-3 bg-navy dark:bg-sand text-white dark:text-navy rounded-xl text-xs font-black uppercase tracking-widest">
                                        Accept Trip
                                    </button>
                                    <button className="flex-1 md:flex-none py-3 bg-gray-50 dark:bg-white/10 text-gray-500 rounded-xl text-xs font-black uppercase">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Request Card 2 */}
                        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group opacity-80">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-forest/20">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anita" alt="Anita" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-navy dark:text-offwhite mb-1">Anita M.</h3>
                                        <div className="flex gap-4 items-center mb-4">
                                            <span className="text-sm font-bold text-forest dark:text-sand">DEL → DXB</span>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Aug 15, 2024</span>
                                        </div>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 text-[10px] font-black uppercase rounded-lg">Language Protocal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[140px]">
                                    <button className="flex-1 md:flex-none py-3 bg-navy dark:bg-sand text-white dark:text-navy rounded-xl text-xs font-black uppercase tracking-widest">
                                        Accept Trip
                                    </button>
                                    <button className="flex-1 md:flex-none py-3 bg-gray-50 dark:bg-white/10 text-gray-500 rounded-xl text-xs font-black uppercase">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
