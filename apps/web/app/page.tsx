"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../i18n/messages";

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
        {/* Navigation */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5">
          <div className="text-xl font-bold tracking-tight text-navy dark:text-offwhite lg:px-4">
            Journey<span className="text-forest dark:text-sand/80">-mate</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-navy dark:text-offwhite/80 lg:px-4">
            <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
              <FormattedMessage id="nav.howItWorks" />
            </a>
            <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
              <FormattedMessage id="nav.safety" />
            </a>
            <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
              <FormattedMessage id="nav.logIn" />
            </a>

            <div className="flex items-center gap-4">
              <select
                value={locale}
                onChange={handleLocaleChange}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer border-none dark:text-offwhite/80 p-0 m-0 w-auto min-w-[30px]"
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
              <button className="bg-navy dark:bg-sand dark:text-navy text-white px-6 py-2 rounded-full font-bold hover:bg-forest dark:hover:bg-white transition-all text-sm shadow-sm">
                <FormattedMessage id="nav.signUp" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 scale-105">
            <Image
              src="/hero-premium.png"
              alt="Travelers in an airport"
              fill
              className="object-cover brightness-75 dark:brightness-50 blur-[3px]"
              priority
            />
            {/* Advanced Dynamic Overlays for Visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60 dark:from-deep-navy/70 dark:via-transparent dark:to-deep-navy/80" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative z-10 max-w-5xl px-8 text-center text-white">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 animate-fade-in [text-shadow:_0_4px_12px_rgba(0,0,0,0.5)] leading-[1.05]">
              <FormattedMessage id="hero.title" />
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-offwhite/95 max-w-3xl mx-auto font-medium leading-relaxed [text-shadow:_0_2px_8px_rgba(0,0,0,0.4)]">
              <FormattedMessage id="hero.subtitle" />
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8 px-4">
              <a href="/dashboard" className="bg-sand text-navy px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-white hover:scale-105 transition-all shadow-2xl flex items-center justify-center whitespace-nowrap">
                <FormattedMessage id="hero.cta" />
              </a>
              <a href="/dashboard" className="glass-button px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl text-white backdrop-blur-xl border-white/30 hover:bg-white/20 hover:scale-105 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
                <FormattedMessage id="hero.browse" />
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-8 bg-gray-50 dark:bg-deep-navy transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-navy dark:text-offwhite mb-4">
                <FormattedMessage id="features.title" />
              </h2>
              <p className="text-gray-600 dark:text-offwhite/60 text-lg">
                <FormattedMessage id="features.subtitle" />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="glass-panel p-10 rounded-3xl dark:bg-white/5 border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-sand/20 dark:bg-sand/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">🤝</div>
                <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-4">
                  <FormattedMessage id="features.verified.title" />
                </h3>
                <p className="text-gray-600 dark:text-offwhite/70 leading-relaxed text-lg">
                  <FormattedMessage id="features.verified.desc" />
                </p>
              </div>

              <div className="glass-panel p-10 rounded-3xl dark:bg-white/5 border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-forest/20 dark:bg-forest/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">✈️</div>
                <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-4">
                  <FormattedMessage id="features.meetups.title" />
                </h3>
                <p className="text-gray-600 dark:text-offwhite/70 leading-relaxed text-lg">
                  <FormattedMessage id="features.meetups.desc" />
                </p>
              </div>

              <div className="glass-panel p-10 rounded-3xl dark:bg-white/5 border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-navy/20 dark:bg-navy/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">📱</div>
                <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-4">
                  <FormattedMessage id="features.tracking.title" />
                </h3>
                <p className="text-gray-600 dark:text-offwhite/70 leading-relaxed text-lg">
                  <FormattedMessage id="features.tracking.desc" />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Travel Section / Testimonial */}
        <section className="py-24 bg-navy text-white text-center dark:bg-black transition-colors">
          <div className="max-w-4xl mx-auto px-8">
            <blockquote className="text-3xl md:text-4xl italic font-serif leading-tight opacity-90 mb-12">
              <FormattedMessage id="quote.text" />
            </blockquote>
            <div className="font-bold tracking-widest text-sm text-sand">
              — <FormattedMessage id="quote.author" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-white dark:bg-deep-navy border-t border-gray-100 dark:border-white/5 transition-colors">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-lg font-bold text-navy dark:text-offwhite">
              Journey<span className="text-forest dark:text-sand/80">-mate</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-offwhite/40">
              © 2024 Journey-mate. All rights reserved. Built with ❤️ for travelers.
            </div>
            <div className="flex gap-8 text-sm font-medium text-navy/70 dark:text-offwhite/60">
              <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Privacy</a>
              <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </main>
    </IntlProvider>
  );
}
