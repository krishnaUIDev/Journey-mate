"use client";

import { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "../i18n/messages";

// Modular Components
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Mission } from "../components/Mission";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";

type Locale = keyof typeof messages;

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Locale initialization
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale && messages[savedLocale]) {
      setLocale(savedLocale);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
      <main className="min-h-screen">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          locale={locale}
          handleLocaleChange={handleLocaleChange}
        />

        <Hero />

        <Mission />

        <Features />

        <Footer theme={theme} />
      </main>
    </IntlProvider>
  );
}
