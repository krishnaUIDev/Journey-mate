# Journey-mate ✈️🤝

**Don't Travel Alone. Find Your Perfect Mate.**

Journey-mate is a mission-driven platform designed to connect travelers with verified companions, ensuring safer, more comfortable, and friendship-filled journeys. Whether it's navigating complex airports, seeking comfort during long flights, or simply wanting a friendly face by your side, Journey-mate is here to help.

**100% free, forever.**

---

## 🌟 Core Features

- **✅ Verified Mates**: Every companion undergoes a thorough vetting process for your peace of mind.
- **💬 Elite Chat Experience**: Rich media messaging with images, voice notes, and a modern **Floating Chat Box** widget for seamless multitasking.
- **🛡️ Custom Squad Identity**: Personalize your travel crew with custom group names and dynamic avatar branding.
- **🌑 Elite Dark Mode**: A premium, high-contrast **Matte Black** theme optimized for night-time coordination.
- **🎥 Real-Time Audio & Video Calls**: Immersive communication with floating call banners, full-screen modes, and AI-powered video filters (Blur/Beauty).
- **📍 Interactive Maps**: High-fidelity map visualizations with pathing between origins and destinations.
- **📱 Universal Responsiveness**: A "Liquid UI" that adapts perfectly to **Mobile, Tablet, and Desktop** with zero layout breakage.
- **🔔 Global Notifications**: Stay updated with a smart notification center and real-time alerts.
- **🌍 Global Community**: Building a worldwide network of assisted travel, powered by compassion.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (>=18)
- **pnpm** (preferred package manager)
- **Supabase CLI** (for database management)

### Installation

```sh
# Clone the repository
git clone git@github.com:krishnaUIDev/Journey-mate.git
cd Journey-mate

# Install dependencies
pnpm install
```

### Development

```sh
# Run the web application
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Technical Stack

This project is a modern monorepo built with [Turborepo](https://turbo.build/):

- **[Next.js 14+](https://nextjs.org/)**: React framework with App Router and Server Components.
- **[Supabase](https://supabase.com/)**: Real-time database, Auth, and Edge Functions.
- **[Clerk](https://clerk.com/)**: Premium identity and user management.
- **[Material UI](https://mui.com/)**: Comprehensive component library for a polished look.
- **[Agora RTC](https://www.agora.io/)**: For ultra-low latency audio and video communication.
- **[Tailwind CSS](https://tailwindcss.com/)**: For custom layout systems and utility-first styling.
- **[pnpm](https://pnpm.io/)**: Fast, disk-efficient package management.

## 📁 Project Structure

```text
.
├── apps
│   └── web          # Next.js web application (Dashboard & Marketplace)
├── packages
│   ├── ui           # Shared component library
│   ├── eslint-config # Shared linting configuration
│   └── typescript-config # Shared TS configurations
├── supabase
│   └── migrations   # Database schema and RLS policies
└── README.md
```

---

Built with ❤️ for travelers everywhere.
