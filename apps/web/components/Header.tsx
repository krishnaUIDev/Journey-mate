"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import {
    Show,
    SignInButton,
    SignUpButton,
    UserButton
} from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSelector } from "./LocaleSelector";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

interface HeaderProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
    locale: string;
    handleLocaleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Header({
    theme,
    toggleTheme,
    locale,
    handleLocaleChange
}: HeaderProps) {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5">
            {/* Mobile Nav toggle and tools */}
            <div className="flex md:hidden items-center gap-4">
                <Show when="signed-out">
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="text-sm font-bold text-navy dark:text-offwhite">Log in</button>
                    </SignInButton>
                </Show>
                <Show when="signed-in">
                    <UserButton />
                </Show>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            {/* Brand Logo & Name */}
            <Link href="/" className="hidden md:flex items-center gap-2 group cursor-pointer">
                <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                    <Image
                        src="/logo.png"
                        alt="Journey-mate Logo"
                        fill
                        sizes="40px"
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
                    Journey<span className="text-forest dark:text-sand/80 text-xl font-bold font-sans">-mate</span>
                    <FlightTakeoffIcon sx={{ fontSize: 22, color: 'forest.main', ml: 0.5, transform: 'rotate(5deg)' }} />
                </span>
            </Link>

            {/* Desktop Nav Group */}
            <div className="hidden md:flex items-center gap-8">
                <div className="flex items-center gap-6 font-medium text-navy dark:text-offwhite/80 lg:px-4">
                    <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
                        <FormattedMessage id="nav.howItWorks" />
                    </a>
                    <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
                        <FormattedMessage id="nav.safety" />
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                    <Show when="signed-out">
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="hover:text-forest dark:hover:text-sand transition-colors text-sm font-medium cursor-pointer mx-2">
                                <FormattedMessage id="nav.logIn" />
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="bg-navy dark:bg-sand dark:text-navy text-white px-6 py-2 rounded-full font-bold hover:bg-forest dark:hover:bg-white transition-all text-sm shadow-sm">
                                <FormattedMessage id="nav.signUp" />
                            </button>
                        </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                        <a href="/dashboard" className="hover:text-forest dark:hover:text-sand transition-colors text-sm font-medium mx-2">
                            Dashboard
                        </a>
                        <UserButton />
                    </Show>
                </div>
            </div>
        </nav>
    );
}
