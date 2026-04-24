# Journey-mate ✈️🤝

**Don't Travel Alone. Find Your Perfect Mate.**

Journey-mate is a mission-driven platform designed to connect travelers with verified companions, ensuring safer, more comfortable, and friendship-filled journeys. Whether it's navigating complex airports, seeking comfort during long flights, or simply wanting a friendly face by your side, Journey-mate is here to help.

**100% free, forever.**

---

## 🌟 Core Features

- **✅ Verified Mates**: Every companion undergoes a thorough vetting process for your peace of mind.
- **💬 Advanced Real-time Chat**: Connect instantly with travel-themed emojis, threaded replies, and message editing/deletion.
- **🔔 Global Notifications**: Stay updated with a smart notification center and real-time alerts for requests and messages.
- **📍 Interactive Maps**: High-fidelity map visualizations with pathing between origins and destinations.
- **📱 Premium Dashboard**: A glassmorphic, responsive interface designed for both mobile and desktop.
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
