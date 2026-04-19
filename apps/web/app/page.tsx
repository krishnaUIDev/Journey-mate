"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5">
        <div className="text-xl font-bold tracking-tight text-navy dark:text-offwhite lg:px-4">
          Journey<span className="text-forest dark:text-sand/80">-mate</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-navy dark:text-offwhite/80 lg:px-4">
          <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">How it works</a>
          <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">Safety</a>
          <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">Log in</a>

          <div className="flex items-center gap-4">
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
              Sign up
            </button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero.png"
          alt="Travel companions"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-navy/50 dark:bg-deep-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy dark:from-deep-navy to-transparent opacity-60" />
        <div className="relative z-10 max-w-7xl w-full px-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-xl">
              Don't Travel Alone. <br />
              Find Your <span className="text-sand">Perfect Mate.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-offwhite/90 font-light drop-shadow-md">
              Connect with verified travel companions who offer assistance, comfort, and friendship during your journey.
              100% free, forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-sand text-navy px-10 py-4 rounded-full text-lg font-bold hover:bg-white dark:hover:bg-offwhite transition-all transform hover:scale-105 shadow-lg">
                Join Journey-mate
              </button>
              <button className="glass-button text-lg dark:text-white dark:border-white/20">
                Browse Companions
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Features Preview */}
      <section className="py-16 px-8 bg-offwhite dark:bg-deep-navy">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-navy dark:text-offwhite mb-4">Why Journey-mate?</h2>
          <p className="text-xl text-navy/70 dark:text-offwhite/60">Building a global community of assisted travel.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-sand/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold mb-4 dark:text-offwhite">Verified Mates</h3>
            <p className="text-navy/60 dark:text-offwhite/60 leading-relaxed font-light">
              Every companion is thoroughly vetted to ensure your safety and peace of mind during travel.
            </p>
          </div>
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-forest/20 rounded-2xl flex items-center justify-center text-3xl mb-6">✈️</div>
            <h3 className="text-2xl font-bold mb-4 dark:text-offwhite">Airport Meetups</h3>
            <p className="text-navy/60 dark:text-offwhite/60 leading-relaxed font-light">
              Meet your companion at the airport for help with check-in, gates, and boarding processes.
            </p>
          </div>
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-navy/20 dark:bg-sand/10 rounded-2xl flex items-center justify-center text-3xl mb-6">📱</div>
            <h3 className="text-2xl font-bold mb-4 dark:text-offwhite">Live Tracking</h3>
            <p className="text-navy/60 dark:text-offwhite/60 leading-relaxed font-light">
              Keep your family informed with real-time flight tracking and arrival notifications.
            </p>
          </div>
        </div>
      </section>
      {/* Trust Quote */}
      <section className="bg-navy dark:bg-deep-navy border-t border-white/5 text-offwhite py-24 px-8 text-center bg-gradient-to-b from-navy to-deep-navy dark:from-deep-navy dark:to-black">
        <div className="max-w-4xl mx-auto">
          <p className="text-3xl md:text-5xl italic font-serif leading-snug mb-10 drop-shadow-md">
            "Journey-mate made it possible for my grandmother to fly across the world safely. It's more than just assistance; it's a connection."
          </p>
          <p className="font-bold text-sand dark:text-sand uppercase tracking-[0.3em] text-xs">— Sarah Jenkins, Frequent Traveler</p>
        </div>
      </section>
    </main>
  );
}
