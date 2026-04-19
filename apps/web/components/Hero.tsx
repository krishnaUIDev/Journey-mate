"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import { SignUpButton, SignInButton } from "@clerk/nextjs";

export function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 overflow-hidden [clip-path:inset(0)]">
            <div className="absolute inset-0 z-0 scale-105">
                <Image
                    src="/hero-premium.png"
                    alt="Travelers in an airport"
                    fill
                    className="object-cover brightness-75 dark:brightness-50 blur-[8px]"
                    priority
                />
                {/* Advanced Dynamic Overlays for Visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60 dark:from-deep-navy/70 dark:via-transparent dark:to-deep-navy/80" />
                <div className="absolute inset-0 bg-black/20" />
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
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="group relative bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-emerald-700 transition-all duration-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 overflow-hidden">
                            <span className="relative z-10 font-black tracking-wide"><FormattedMessage id="hero.ctaPrimary" /></span>
                            <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        </button>
                    </SignUpButton>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="bg-transparent border-2 border-white/40 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-1">
                            <FormattedMessage id="hero.ctaSecondary" />
                        </button>
                    </SignInButton>
                </div>
            </div>
        </section>
    );
}
