"use client";

import React from "react";
import Image from "next/image";

export function BuyMeACoffeeFloating() {
    return (
        <div className="fixed bottom-8 right-8 z-[9999] group">
            <a
                href="https://www.buymeacoffee.com/journeymate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 p-2 pr-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-700 hover:scale-105 active:scale-95 group"
                aria-label="Buy Me a Coffee"
            >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#FFDD00] flex items-center justify-center transition-transform duration-700 group-hover:rotate-[12deg]">
                    <img
                        src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                        alt="BMC Logo"
                        className="w-7 h-7"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-offwhite/40 leading-none mb-1 group-hover:text-[#FFDD00] transition-colors duration-500">
                        Support Us
                    </span>
                    <span className="text-sm font-bold text-navy dark:text-offwhite tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-500">
                        Buy me a coffee
                    </span>
                </div>

                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#FFDD00]/0 group-hover:border-[#FFDD00]/30 transition-all duration-700 -m-1" />
            </a>

            {/* Tooltip background pulse */}
            <div className="absolute -inset-4 bg-[#FFDD00]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        </div>
    );
}
