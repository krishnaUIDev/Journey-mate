import Image from "next/image";
export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white shadow-md border-b border-gray-100">
        <div className="text-xl font-bold tracking-tight text-navy lg:px-4">
          Journey<span className="text-forest">-mate</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-navy lg:px-4">
          <a href="#" className="hover:text-forest transition-colors text-sm">How it works</a>
          <a href="#" className="hover:text-forest transition-colors text-sm">Safety</a>
          <a href="#" className="hover:text-forest transition-colors text-sm">Log in</a>
          <button className="bg-navy text-white px-6 py-2 rounded-full font-bold hover:bg-forest transition-all text-sm shadow-sm">
            Sign up
          </button>
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
        <div className="absolute inset-0 bg-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60" />
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
              <button className="bg-sand text-navy px-10 py-4 rounded-full text-lg font-bold hover:bg-white transition-all transform hover:scale-105 shadow-lg">
                Join Journey-mate
              </button>
              <button className="glass-button text-lg">
                Browse Companions
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Features Preview */}
      <section className="py-16 px-8 bg-offwhite">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-navy mb-4">Why Journey-mate?</h2>
          <p className="text-xl text-navy/70">Building a global community of assisted travel.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-sand/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold mb-4">Verified Mates</h3>
            <p className="text-navy/60 leading-relaxed font-light">
              Every companion is thoroughly vetted to ensure your safety and peace of mind during travel.
            </p>
          </div>
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-forest/20 rounded-2xl flex items-center justify-center text-3xl mb-6">✈️</div>
            <h3 className="text-2xl font-bold mb-4">Airport Meetups</h3>
            <p className="text-navy/60 leading-relaxed font-light">
              Meet your companion at the airport for help with check-in, gates, and boarding processes.
            </p>
          </div>
          <div className="glass-panel p-10 rounded-3xl transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-navy/20 rounded-2xl flex items-center justify-center text-3xl mb-6">📱</div>
            <h3 className="text-2xl font-bold mb-4">Live Tracking</h3>
            <p className="text-navy/60 leading-relaxed font-light">
              Keep your family informed with real-time flight tracking and arrival notifications.
            </p>
          </div>
        </div>
      </section>
      {/* Trust Quote */}
      <section className="bg-navy text-offwhite py-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-3xl md:text-4xl italic font-serif leading-snug mb-8">
            "Journey-mate made it possible for my grandmother to fly across the world safely. It's more than just assistance; it's a connection."
          </p>
          <p className="font-bold text-sand uppercase tracking-widest text-sm">— Sarah Jenkins, Frequent Traveler</p>
        </div>
      </section>
    </main>
  );
}
