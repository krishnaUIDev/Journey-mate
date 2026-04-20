"use client";

import React, { useState, useEffect } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import Link from "next/link";
import Image from "next/image";
import { messages } from "../../i18n/messages";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LocaleSelector } from "../../components/LocaleSelector";
import { UserButton, Show } from "@clerk/nextjs";
import { PostJourneyModal } from "./components/PostJourneyModal";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

type Locale = keyof typeof messages;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="min-h-screen bg-gray-50 dark:bg-deep-navy font-sans transition-colors duration-300">
                    {/* Global Dashboard Header */}
                    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group cursor-pointer text-decoration-none">
                                <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                                    <Image
                                        src="/logo.png"
                                        alt="Journey-mate Logo"
                                        fill
                                        className="object-contain dark:brightness-200 dark:contrast-150"
                                    />
                                </div>
                                <span className="text-xl font-bold text-navy dark:text-offwhite tracking-tight">
                                    Journey<span className="text-forest dark:text-sand/80 font-bold">-mate</span>
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-8">
                            {/* Post a Journey Button */}
                            <button
                                className="bg-navy dark:bg-sand text-white dark:text-navy px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-forest transition-all shadow-md active:scale-95"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-post-trip'))}
                            >
                                Post a Journey
                            </button>

                            <div className="flex items-center gap-3 lg:gap-5 ml-2 lg:ml-4 border-l border-gray-100 dark:border-white/10 pl-4 lg:pl-8">
                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                                <Show when="signed-in">
                                    <UserButton />
                                </Show>
                            </div>
                        </div>
                    </nav>

                    <main>
                        {children}
                    </main>

                    <PostJourneyModal />
                </div>
            </LocalizationProvider>
        </IntlProvider>
    );
}
