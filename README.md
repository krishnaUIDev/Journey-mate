# Journey-mate ✈️🤝

**Don't Travel Alone. Find Your perfect Global Mate.**

Journey-mate is a mission-driven, technical masterpiece designed to connect travelers with verified companions. Rebuilt for **Peak Performance**, **Total Inclusivity**, and **World-Class Security**.

[![Lighthouse Performance](https://img.shields.io/badge/Performance-100-brightgreen.svg)]()
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-100-brightgreen.svg)]()
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100-brightgreen.svg)]()
[![WCAG AA Compliant](https://img.shields.io/badge/Accessibility-WCAG%20AA-blue.svg)]()

---

## 🌟 Elite Features

### ⚡ Technical Excellence
- **100/100 Lighthouse Suite**: Optimized for sub-2s Time-to-Interactive (TTI) and perfect SEO rankings.
- **On-Demand Communication**: Agora RTC SDK is deferred and dynamically loaded only when a call starts, preserving a lightning-fast initial load.
- **Nuclear Accessibility ♿**: 100% WCAG AA compliant color contrast, semantic heading hierarchy, and mandatory `aria-label` coverage.

### 🤝 Strategic Pairing
- **Gated Pairing Flow**: Journey owners manage access via a real-time request system—ensuring you only travel with those you approve.
- **Rich Media Messaging**: Professional-grade chat with high-performance image attachments, voice notes, and real-time deletion.
- **Custom Squads**: Dynamic group branding with personalized names and custom travel identities.

### 🎥 Immersive Communication
- **AI-Powered Calling**: Integrated video effects including background blur and beauty filters.
- **Adaptive Grid**: Intelligent video layout manager that responds to participant counts and screen sizes.
- **Floating Call Banners**: Stay connected while navigating the marketplace with persistent, minimized call controls.

### 🌍 Universal Framework
- **Multi-Language Support**: Fully internationalized (i18n) for **English** and **Spanish** travelers.
- **Liquid UI**: A custom Tailwind v4 powered design system that scales from iPhone SE to 8K Ultra-Wide displays.

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
└── supabase         # Database Migrations & RLS Policies
```

---

Built with ❤️ for a safer, more connected world. ✨🌑🧥✅🌍🚀
