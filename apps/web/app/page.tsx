"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../i18n/messages";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs";

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
          <div className="flex md:hidden items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
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

          <div className="hidden md:flex items-center gap-6 font-medium text-navy dark:text-offwhite/80 lg:px-4">
            <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
              <FormattedMessage id="nav.howItWorks" />
            </a>
            <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
              <FormattedMessage id="nav.safety" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2">
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
              <SignInButton mode="modal">
                <button className="hover:text-forest dark:hover:text-sand transition-colors text-sm font-medium cursor-pointer mx-2">
                  <FormattedMessage id="nav.logIn" />
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
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
        </nav>

        {/* Hero Section */}
        <section className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden py-10 px-4 [clip-path:inset(0)]">
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

          <div className="relative z-10 max-w-5xl px-8 text-center text-white">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-4 animate-fade-in [text-shadow:_0_4px_12px_rgba(0,0,0,0.5)] leading-[1.05]">
              <FormattedMessage id="hero.title" />
            </h1>
            <p className="text-lg md:text-xl mb-6 text-offwhite/95 max-w-2xl mx-auto font-medium leading-relaxed [text-shadow:_0_2px_8px_rgba(0,0,0,0.4)]">
              <FormattedMessage id="hero.subtitle" />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 px-4">
              <a href="/dashboard" className="bg-sand text-navy px-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-white hover:scale-105 transition-all shadow-2xl flex items-center justify-center whitespace-nowrap">
                <FormattedMessage id="hero.cta" />
              </a>
              <a href="/dashboard" className="glass-button px-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg text-white backdrop-blur-xl border-white/30 hover:bg-white/20 hover:scale-105 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
                <FormattedMessage id="hero.browse" />
              </a>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white dark:bg-black transition-colors overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 order-2 lg:order-1">
                <h2 className="text-sm font-bold tracking-[0.2em] text-forest dark:text-sand uppercase mb-6">
                  <FormattedMessage id="mission.header" />
                </h2>
                <div className="space-y-12">
                  <div className="relative pl-14 group">
                    <div className="absolute left-0 top-0.5 w-10 h-10 rounded-2xl bg-sand/20 dark:bg-sand/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">🛡️</div>
                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3">
                      <FormattedMessage id="mission.safety.title" />
                    </h3>
                    <p className="text-gray-500 dark:text-offwhite/50 leading-relaxed text-lg">
                      <FormattedMessage id="mission.safety.desc" />
                    </p>
                  </div>

                  <div className="relative pl-14 group">
                    <div className="absolute left-0 top-0.5 w-10 h-10 rounded-2xl bg-forest/20 dark:bg-forest/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm">📍</div>
                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3">
                      <FormattedMessage id="mission.peace.title" />
                    </h3>
                    <p className="text-gray-500 dark:text-offwhite/50 leading-relaxed text-lg">
                      <FormattedMessage id="mission.peace.desc" />
                    </p>
                  </div>

                  <div className="relative pl-14 group">
                    <div className="absolute left-0 top-0.5 w-10 h-10 rounded-2xl bg-navy/20 dark:bg-navy/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">❤️</div>
                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3">
                      <FormattedMessage id="mission.community.title" />
                    </h3>
                    <p className="text-gray-500 dark:text-offwhite/50 leading-relaxed text-lg">
                      <FormattedMessage id="mission.community.desc" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 order-1 lg:order-2 w-full lg:w-auto">
                <div className="aspect-[4/5] relative rounded-[4rem] overflow-hidden lg:rotate-3 hover:rotate-0 transition-transform duration-1000 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
                  <Image
                    src="/mission-visual.png"
                    alt="Journey-mate Mission"
                    fill
                    className="object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-12 left-12 right-12">
                    <div className="text-white text-xl font-medium italic leading-relaxed drop-shadow-lg">
                      "Building a self-sustaining network of human kindness."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 pt-12 pb-24 px-8 bg-gray-50 dark:bg-deep-navy transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
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
        <footer className="pt-20 pb-12 bg-white dark:bg-deep-navy border-t border-gray-100 dark:border-white/5 transition-colors">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                    <Image
                      src="/logo.png"
                      alt="Journey-mate Logo"
                      fill
                      className="object-contain dark:brightness-200 dark:contrast-150"
                    />
                  </div>
                  <span
                    className="text-2xl font-bold text-navy dark:text-offwhite"
                    style={{
                      textShadow: theme === "light"
                        ? "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 1px 2px rgba(0,0,0,0.2)"
                        : "0 1px 0 #222, 0 2px 0 #1a1a1a, 0 3px 0 #111, 0 1px 2px rgba(0,0,0,0.5)"
                    }}
                  >
                    Journey<span className="text-forest dark:text-sand/80">-mate</span>
                  </span>
                </div>
                <p className="text-gray-500 dark:text-offwhite/50 max-w-xs leading-relaxed mb-6">
                  Connecting travelers for safer, more comfortable journeys. Join thousands of verified companions today.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-navy dark:text-offwhite hover:bg-navy hover:text-white dark:hover:bg-offwhite dark:hover:text-deep-navy transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-navy dark:text-offwhite hover:bg-navy hover:text-white dark:hover:bg-offwhite dark:hover:text-deep-navy transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-navy dark:text-offwhite mb-6">Product</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-offwhite/50">
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">How it works</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Safety</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-navy dark:text-offwhite mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-offwhite/50">
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-navy dark:text-offwhite mb-6">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-offwhite/50">
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-forest dark:hover:text-sand transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-offwhite/30">
              <div>© 2024 Journey-mate. All rights reserved.</div>
              <div className="flex gap-4">
                <span>Built with ❤️ for travelers everywhere.</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </IntlProvider >
  );
}
