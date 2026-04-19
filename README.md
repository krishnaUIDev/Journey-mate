# Journey-mate ✈️🤝

**Don't Travel Alone. Find Your Perfect Mate.**

Journey-mate is a mission-driven platform designed to connect travelers with verified companions, ensuring safer, more comfortable, and friendship-filled journeys. Whether it's navigating complex airports, seeking comfort during long flights, or simply wanting a friendly face by your side, Journey-mate is here to help.

**100% free, forever.**

---

## 🌟 Core Features

- **✅ Verified Mates**: Every companion undergoes a thorough vetting process for your peace of mind.
- **📍 Airport Meetups**: Coordination for help with check-in, security, and finding gates.
- **📱 Live Tracking**: Keep loved ones informed with real-time flight status and arrival notifications.
- **🌍 Global Community**: Building a worldwide network of assisted travel, powered by compassion.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (>=18)
- **pnpm** (preferred package manager)

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
pnpm run dev --filter web
```

The application will be available at `http://localhost:3000`.

## 🏗️ Technical Stack

This project is a modern monorepo built with [Turborepo](https://turbo.build/):

- **[Next.js](https://nextjs.org/)**: React framework for the web frontend.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS for premium, responsive design.
- **[pnpm](https://pnpm.io/)**: Fast, disk-efficient package management.
- **[packages/ui](./packages/ui)**: Shared, accessible React component library.
- **[i18n](./apps/web/i18n)**: Built-in multi-language support (English, Hindi, Telugu, Tamil, Kannada, Bengali).

## 📁 Project Structure

```text
.
├── apps
│   └── web          # The main Next.js landing page & dashboard
├── packages
│   ├── ui           # Shared component library
│   ├── eslint-config # Shared linting configuration
│   └── typescript-config # Shared TS configurations
└── README.md
```

---

Built with ❤️ for travelers everywhere.
