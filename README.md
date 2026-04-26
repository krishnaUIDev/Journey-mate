# Journey-mate ✈️🤝

**Don't Travel Alone. Find Your perfect Global Mate.**

Journey-mate is a mission-driven, technical masterpiece designed to connect travelers with verified companions. Rebuilt for **Peak Performance**, **Total Inclusivity**, and **World-Class Security**.

[![Lighthouse Performance](https://img.shields.io/badge/Performance-100-brightgreen.svg)]()
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-100-brightgreen.svg)]()
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100-brightgreen.svg)]()
[![WCAG AA Compliant](https://img.shields.io/badge/Accessibility-WCAG%20AA-blue.svg)]()

---

## 🌟 Elite Features

### ✈️ Boarding Pass Live Preview
- **High-Fidelity Virtual Tickets**: Airline-inspired boarding pass visualization with real-time field synchronization.
- **Real-Time Weather Pulse 🌦️**: Global, coordinate-based arrival forecasts using the Open-Meteo API.
- **Universal Scan Loop 🔍**: Scannable deep-link QR codes that reconstruct tickets on any mobile device.
- **Native Wallet Integration 💳**: One-tap "Add to Apple Wallet" and "Add to Google Wallet" buttons.

### 📝 Traveler Storytelling (Blog)
- **Rich Media Narratives**: Dynamic blogging system for travelers to share their stories.
- **Interactive Orientation Maps 🗺️**: Integrated Leaflet maps with great-circle journey pathing.
- **Traveler Attribution**: Premium author cards with community trust indicators.

### ⚡ Technical Excellence
- **100/100 Lighthouse Suite**: Optimized for sub-2s TTI and perfect SEO rankings.
- **On-Demand Communication**: Agora RTC SDK is deferred and dynamically loaded only when a call starts.
- **Hydration-Safe SSR**: Advanced React pattern for stable dynamic asset rendering.
- **Nuclear Accessibility ♿**: 100% WCAG AA compliant contrast and semantic hierarchy.

### 🤝 Strategic Pairing & Smart Tools
- **Gated Pairing Flow**: Journey owners manage access via a real-time request system.
- **AI Smart Drafts 🪄**: Instantly generate compelling journey descriptions using AI.
- **Luggage Tracker 🧳**: Smart luggage capacity tracking and "Luggage Guard" trust badges.
- **Collaborative Expenses**: Real-time group cost sharing and settlement reconciliation.
- **Security Vault 🔒**: Secure, time-gated emergency contact sharing.

---

## 🏗️ The Technical Stack

Journey-mate is a high-performance monorepo architected for scale:

- **Framework**: [Next.js 15+ (Turbopack)](https://nextjs.org/) with App Router.
- **Database/Realtime**: [Supabase](https://supabase.com/) with PostgREST and Realtime Channels.
- **Auth**: [Clerk](https://clerk.com/) Elite Identity & User Management.
- **RTC Engine**: [Agora SDK](https://www.agora.io/) for ultra-low latency voice/video.
- **UI Engine**: [Material UI v6](https://mui.com/) + [Tailwind CSS v4](https://tailwindcss.com/).
- **Maps**: [Leaflet](https://leafletjs.com/) with Great Circle Pathing (geodesics).

---

## 🚀 Getting Started

### Installation
```sh
# Clone the repository
git clone git@github.com:krishnaUIDev/Journey-mate.git
cd Journey-mate

# Install dependencies with lockfile integrity
pnpm install
```

### Development
```sh
# Launch the Turbopack dev server
pnpm run dev
```

The application will be available at `http://localhost:3000`.

---

## 📁 Monorepo Structure

```text
.
├── apps
│   └── web          # Next.js 15 Web Application (Marketplace & Dashboard)
├── packages
│   ├── ui           # Shared Design System & Components
│   ├── eslint-config # Professional Linting Rules
│   └── typescript-config # Strict TS Configurations
├── supabase         # Database Migrations & RLS Policies
└── database_schema.md # [View Database Relationships](./database_schema.md)
```

---

Built with ❤️ for a safer, more connected world. ✨🌑🧥✅🌍🚀
