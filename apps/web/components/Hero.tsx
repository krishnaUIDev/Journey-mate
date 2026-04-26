"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function Hero() {
    const { user, isLoaded } = useUser();

    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 overflow-hidden [clip-path:inset(0)]">
            <div className="absolute inset-0 z-0 scale-105">
                <Image
                    src="/hero-premium.png"
                    alt="Travelers in an airport"
                    fill
                    className="object-cover brightness-50 blur-[8px]"
                    priority
                />
                {/* Advanced Dynamic Overlays for Visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80 dark:from-black/70 dark:via-transparent dark:to-black/90" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 text-center max-w-4xl animate-fade-in group">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent">
                    <FormattedMessage id="hero.badge" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight [text-wrap:balance]">
                    <FormattedMessage id="hero.title" />
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-12 font-medium max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
                    <FormattedMessage id="hero.subtitle" />
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    {isLoaded && !user && (
                        <>
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="group relative bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-emerald-700 transition-all duration-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 overflow-hidden" aria-label="Join Journey Mate">
                                    <span className="relative z-10 font-black tracking-wide">
                                        <FormattedMessage id="hero.ctaPrimary" />
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                                </button>
                            </SignUpButton>
                            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="bg-transparent border-2 border-white/40 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-1" aria-label="Browse Companions">
                                    Browse Companions
                                </button>
                            </SignInButton>
                        </>
                    )}
                    {isLoaded && user && (
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <button className="w-full group relative bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-emerald-700 transition-all duration-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 overflow-hidden" aria-label="Go to Dashboard">
                                <span className="relative z-10 font-black tracking-wide">Browse Companions</span>
                                <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                            </button>
                        </Link>
                    )}
                </div>

                <div className="mt-12 flex justify-center animate-bounce-slow">
                    <a href="https://www.buymeacoffee.com/journeymate" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 px-6 py-3 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl">
                        <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="BMC Logo" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <span className="text-white/80 group-hover:text-white font-bold text-sm tracking-tight">Support Journey-mate</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
