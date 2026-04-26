"use client";

import React, { useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

type Locale = keyof typeof messages;

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");

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
                <div className="min-h-screen bg-offwhite dark:bg-navy transition-colors duration-300">
                    <Header
                        theme={theme}
                        toggleTheme={toggleTheme}
                        locale={locale}
                        handleLocaleChange={handleLocaleChange}
                    />
                    <main>
                        {children}
                    </main>
                    <Footer theme={theme} />
                </div>
            </LocalizationProvider>
        </IntlProvider>
    );
}
