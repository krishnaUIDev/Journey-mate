"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import {
    Show,
    SignInButton,
    SignUpButton,
    UserButton
} from "@clerk/nextjs";

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
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "light" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                    )}
                </button>
            </div>

            {/* Brand Logo & Name */}
            <div className="hidden md:flex items-center gap-2">
                <div className="relative w-10 h-10 overflow-hidden rounded-lg">
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
                    Journey<span className="text-forest dark:text-sand/80">-mate</span>
                </span>
            </div>

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
                    <select
                        value={locale}
                        onChange={handleLocaleChange}
                        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer border-none dark:text-offwhite/80 p-0 m-0 w-auto"
                    >
                        <option value="en">English</option>
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="kn">ಕನ್ನಡ (Kannada)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                    </select>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                        )}
                    </button>

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
